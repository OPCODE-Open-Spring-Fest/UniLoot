import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./controllers/auth";
import { authenticate, AuthRequest } from "./middleware/authMiddleware";

// Routes
import healthRoutes from "./routes/healthRoutes";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cartRoutes";
import auctionRoutes from "./routes/auctionRoutes";
import notificationRoutes from "./routes/notification.routes";

dotenv.config();

const app: Application = express();

// ------------------- Middleware Setup -------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ------------------- Mock User & Auth Handling -------------------
interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
}

const users: User[] = [
  { id: "1", username: "alice", passwordHash: bcrypt.hashSync("password", 8), role: "admin" },
];

const refreshTokens = new Map<string, string>();

// ------------------- Auth Routes -------------------
app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const payload = { sub: user.id, username: user.username, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  refreshTokens.set(user.id, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

app.post("/refresh", (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) return res.status(401).json({ error: "Refresh token missing" });

  try {
    const payload = verifyRefreshToken(token);
    const storedToken = refreshTokens.get(payload.sub);

    if (!storedToken || storedToken !== token)
      return res.status(401).json({ error: "Invalid or expired session" });

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
    res.status(401).json({ error: "Refresh token expired or invalid" });
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

// ------------------- API Routes -------------------
app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/notifications", notificationRoutes);

// ------------------- Default Route -------------------
app.get("/", (_req, res) => {
  res.send("API is running 🚀 with real-time notifications backend ready!");
});

// ------------------- MongoDB Connection -------------------
const mongoUri = process.env.MONGO_URI;
if (mongoUri && (mongoUri.startsWith("mongodb://") || mongoUri.startsWith("mongodb+srv://"))) {
  mongoose
    .connect(mongoUri)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
} else {
  console.warn("⚠️ MONGO_URI not set or invalid. Skipping DB connection.");
}

export default app;
