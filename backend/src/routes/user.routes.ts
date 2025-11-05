// src/routes/userRoutes.ts
import express from "express";
import { register, verifyEmail, login, getMe } from "../controllers/auth.controller";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
