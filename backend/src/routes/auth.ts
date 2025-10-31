import express, { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../models/user.model.js";

const router = express.Router();

// Request password reset
router.post("/request-reset", async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        const resetLink = `http://localhost:5173/reset-password/${token}`;

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
            html: `<p>Click the link to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ msg: "Reset link sent to email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
});

// Reset password with token
router.post("/reset-password/:token", async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ msg: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
});

export default router;
