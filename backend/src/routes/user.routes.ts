// src/routes/userRoutes.ts
import express from "express";
import { register, verifyEmail, login, getMe, googleAuth } from "../controllers/auth.controller";
import { protect } from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
} from "../validations/userValidation";
const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.get("/verify/:token", validateRequest(verifyEmailSchema), verifyEmail);
router.post("/login", validateRequest(loginSchema), login);
router.post("/google", googleAuth);
router.get("/me", protect, getMe);
router.get("/me", protect, getMe);

export default router;
