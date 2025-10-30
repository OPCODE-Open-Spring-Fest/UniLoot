// src/controllers/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { User } from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
    // service: "gmail",
    // auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    // },
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'kiarra.dietrich11@ethereal.email',
        pass: 'Du8rSm184HzwwHsHYm'
    }
});

const generateToken = (id: string) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

// Register user
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const verificationToken = crypto.randomBytes(20).toString("hex");
        const user = await User.create({ name, email, password, verificationToken });

        const verificationLink = `${CLIENT_URL}/verify/${verificationToken}`;
        await transporter.sendMail({
            to: email,
            subject: "Verify your email",
            html: `<p>Click <a href="${verificationLink}">here</a> to verify your account.</p>`,
        });

        res.status(201).json({ message: "User registered. Check your email for verification link." });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error });
    }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Verification failed", error });
    }
};

// Login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid credentials" });
        if (!user.isVerified) return res.status(403).json({ message: "Please verify your email" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(String(user._id));
        res.status(200).json({ token, user: { name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
};

// Get current user
export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
};
