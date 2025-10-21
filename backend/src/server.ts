import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./controllers/auth";
import { authenticate, AuthRequest } from "./middleware/authMiddleware";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());


interface User {
    id: string;
    username: string;
    passwordHash: string;
    role: string;
}

const users: User[] = [
    { id: "1", username: "alice", passwordHash: bcrypt.hashSync("password", 8), role: "admin" },
];

const refreshTokens = new Map<string, string>()

app.post("/login", async (req, res) => {
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

app.post("/refresh", (req, res) => {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (!token) {
        return res.status(401).json({ error: "Refresh token is missing" });
    }

    try {
        const payload = verifyRefreshToken(token);
        const storedToken = refreshTokens.get(payload.sub);

        console.log("--- REFRESH TOKEN COMPARISON DEBUG ---");
        console.log(`User ID (sub): ${payload.sub}`);
        console.log(`Token from request (RT): ${token}`);
        console.log(`Stored token from Map: ${storedToken}`);
        console.log(`Tokens are strictly equal (storedToken === token): ${storedToken === token}`);
        console.log(`Type of request token: ${typeof token}`);
        console.log(`Type of stored token: ${typeof storedToken}`);
        console.log("--------------------------------------");
        
        if (!storedToken) {
            return res.status(401).json({ error: "Session not found or already logged out" });
        }
        
        if (storedToken !== token) {
            return res.status(401).json({ error: "Token used is not the latest valid token" });
        }

        const cleanPayload = {
            sub: payload.sub,
            username: payload.username,
            role: payload.role
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

app.post("/logout", authenticate, (req: AuthRequest, res) => {
    refreshTokens.delete(req.user!.sub);
    res.clearCookie("refreshToken");
    res.status(204).send();
});

app.get("/protected", authenticate, (req: AuthRequest, res) => {
    res.json({ message: "Protected route accessed", user: req.user });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));