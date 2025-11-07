import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { requestLogger } from "./middleware/loggerMiddleware";
import { errorHandler } from "./middleware/errorMiddleware";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

import healthRoutes from "./routes/healthRoutes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cartRoutes.js";
import authRoutes from "./routes/auth.js";

import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./controllers/auth.js";
import { authenticate, AuthRequest } from "./middleware/authMiddleware.js";

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(requestLogger);
// Interface and mock data (temporary)
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
    { id: "1", username: "alice", passwordHash: bcrypt.hashSync("password", 8), role: "admin", email: "alice@example.com" },
];

const refreshTokens = new Map<string, string>();

// ------------------- AUTHENTICATION ROUTES -------------------

app.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);


// app.get("/protected", authenticate, (req: AuthRequest, res: Response) => {
//     res.json({ message: "Protected route accessed", user: req.user });
// });

    res.json({ accessToken });
});

app.post("/refresh", (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
        return res.status(401).json({ error: "Refresh token is missing" });
    }

    try {
        const payload = verifyRefreshToken(token);
        const storedToken = refreshTokens.get(payload.sub);

        if (!storedToken) {
            return res.status(401).json({ error: "Session not found or already logged out" });
        }

        if (storedToken !== token) {
            return res.status(401).json({ error: "Token used is not the latest valid token" });
        }

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
        console.error("Refresh token verification failed:", error);
        res.status(401).json({ error: "Refresh token is expired or invalid" });
    }
});

app.post("/logout", authenticate, (req: AuthRequest, res: Response) => {
    refreshTokens.delete(req.user!.sub);
    res.clearCookie("refreshToken");
    res.status(204).send();
});

app.get("/protected", authenticate, (req: AuthRequest, res: Response) => {
    res.json({ message: "Protected route accessed", user: req.user });
});

// ------------------- PASSWORD RESET ROUTES -------------------

/**
 * Step 1: Request password reset
 * Generates token, sets expiry, and emails reset link.
 */
app.post("/api/request-reset", async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = users.find((u) => u.email === email);

    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
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
        console.error("Email send failed:", error);
        res.status(500).json({ msg: "Failed to send reset email" });
    }
});

/**
 * Step 2: Reset password with token
 * Validates token, hashes new password, updates it.
 */
app.post("/api/reset-password/:token", async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = users.find(
        (u) => u.resetPasswordToken === token && u.resetPasswordExpires && u.resetPasswordExpires > new Date()
    );

    if (!user) {
        return res.status(400).json({ msg: "Invalid or expired token" });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    res.json({ msg: "Password updated successfully" });
});

// ------------------- ROUTES -------------------

app.use("/api/health", healthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", authRoutes);

// ------------------- DEFAULT -------------------

app.get("/", (_req, res) => {
    res.send("API is running");
});
app.use("/api/users", userRoutes);

// ------------------- DATABASE -------------------

const mongoUri = process.env.MONGO_URI;
if (mongoUri && (mongoUri.startsWith("mongodb://") || mongoUri.startsWith("mongodb+srv://"))) {
    mongoose
        .connect(mongoUri)
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.error("MongoDB connection error:", err));
} else {
    console.warn("MONGO_URI not set or invalid. Skipping MongoDB connection. Set MONGO_URI in .env to enable DB.");
}
app.use(errorHandler);
export default app;
