import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import { requestLogger } from "./middleware/loggerMiddleware";
import { errorHandler } from "./middleware/errorMiddleware";
import { generalRateLimiter, authRateLimiter, apiRateLimiter } from "./middleware/rateLimiter";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

import healthRoutes from "./routes/healthRoutes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cartRoutes.js";
import authRoutes from "./routes/auth.js";
import auctionRoutes from "./routes/auctionRoutes";
import paymentRoutes from "./routes/paymentRoutes";

import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} from "./controllers/auth.js";

import {
    authenticate,
    authorizeRole,
    authorizeRoles,
    AuthRequest
} from "./middleware/authMiddleware.js";

dotenv.config();

const app: Application = express();

app.set("trust proxy", 1);

// ------------------- MIDDLEWARE -------------------
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(generalRateLimiter);
app.use(requestLogger);

// ------------------- MOCK USER DATA -------------------
interface User {
    id: string;
    username: string;
    passwordHash: string;
    role: string;
    email?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

const users: User[] = [
    {
        id: "1",
        username: "alice",
        passwordHash: bcrypt.hashSync("password", 8),
        role: "admin",
        email: "alice@example.com"
    },
];

const refreshTokens = new Map<string, string>();

// ------------------- AUTHENTICATION ROUTES -------------------

app.post("/login", authRateLimiter, async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Store refresh token for session control
    refreshTokens.set(user.id, refreshToken);

    res.json({ accessToken });
});

app.post("/refresh", authRateLimiter, (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
        return res.status(401).json({ error: "Refresh token is missing" });
    }

    try {
        const payload = verifyRefreshToken(token);
        const storedToken = refreshTokens.get(payload.sub);

        // Validate session
        if (!storedToken)
            return res.status(401).json({ error: "Session not found or expired" });

        if (storedToken !== token)
            return res.status(401).json({ error: "Invalid refresh token" });

        const cleanPayload = {
            sub: payload.sub,
            username: payload.username,
            role: payload.role,
        };

        const newAccess = signAccessToken(cleanPayload);
        const newRefresh = signRefreshToken(cleanPayload);

        refreshTokens.set(cleanPayload.sub, newRefresh);

        res.cookie("refreshToken", newRefresh, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken: newAccess });

    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(401).json({ error: "Refresh token invalid or expired" });
    }
});

app.post("/logout", authenticate, (req: AuthRequest, res: Response) => {
    refreshTokens.delete(req.user!.sub);
    res.clearCookie("refreshToken");
    res.status(204).send();
});

// Example protected route
app.get("/protected", authenticate, (req: AuthRequest, res: Response) => {
    res.json({ message: "Protected route accessed", user: req.user });
});

// ------------------- PASSWORD RESET ROUTES -------------------

app.post("/api/request-reset", authRateLimiter, async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = users.find((u) => u.email === email);

    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: "Password Reset",
        html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ msg: "Reset link sent to email" });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ msg: "Failed to send email" });
    }
});

app.post("/api/reset-password/:token", authRateLimiter, async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = users.find(
        (u) =>
            u.resetPasswordToken === token &&
            u.resetPasswordExpires &&
            u.resetPasswordExpires > new Date()
    );

    if (!user) {
        return res.status(400).json({ msg: "Invalid or expired token" });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    res.json({ msg: "Password updated successfully" });
});

// ------------------- ROUTES WITH RBAC -------------------

// Public
app.use("/api/health", healthRoutes);

// Products — junior, senior, admin
app.use("/api/products", apiRateLimiter, authenticate, authorizeRoles("junior", "senior", "admin"), productRoutes);

// Users — admin only
app.use("/api/users", apiRateLimiter, authenticate, authorizeRole("admin"), userRoutes);

// Cart — all authenticated roles
app.use("/api/cart", apiRateLimiter, authenticate, authorizeRoles("junior", "senior", "admin"), cartRoutes);

// Auctions — senior + admin
app.use("/api/auctions", apiRateLimiter, authenticate, authorizeRoles("senior", "admin"), auctionRoutes);

// Payments — senior + admin
app.use("/api/payments", apiRateLimiter, authenticate, authorizeRoles("senior", "admin"), paymentRoutes);

// Auth
app.use("/api", authRoutes);

// ------------------- DEFAULT ROUTE -------------------
app.get("/", (_req, res) => {
    res.send("API is running");
});

// ------------------- DATABASE -------------------
const mongoUri = process.env.MONGO_URI;

if (mongoUri && (mongoUri.startsWith("mongodb://") || mongoUri.startsWith("mongodb+srv://"))) {
    mongoose
        .connect(mongoUri)
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.error("MongoDB connection error:", err));
} else {
    console.warn("Invalid or missing MONGO_URI.");
}

app.use(errorHandler);

export default app;
