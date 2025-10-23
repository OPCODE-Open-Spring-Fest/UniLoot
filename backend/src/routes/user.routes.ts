import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
const { v4: uuidv4 } = require("uuid");

interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  verified: boolean;
  verificationToken?: string;
}

const users: User[] = [];

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER || "test@ethereal.email",
    pass: process.env.SMTP_PASS || "password",
  },
});

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  const existingUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (existingUser)
    return res.status(400).json({ error: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4();

  const newUser: User = {
    id: uuidv4(),
    username,
    email,
    passwordHash,
    verified: false,
    verificationToken,
  };

  users.push(newUser);

  const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:4000"}/api/users/verify-email?token=${verificationToken}`;

  try {
    await transporter.sendMail({
      from: `"Support" <no-reply@example.com>`,
      to: email,
      subject: "Verify your email",
      text: `Click the following link to verify your email: ${verificationUrl}`,
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({
      message: "User registered. Verification email sent.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending verification email" });
  }
});

router.get("/verify-email", (req: Request, res: Response) => {
  const token = req.query.token as string;
  if (!token) return res.status(400).json({ error: "Token missing" });

  const user = users.find((u) => u.verificationToken === token);
  if (!user) return res.status(400).json({ error: "Invalid or expired token" });

  user.verified = true;
  delete user.verificationToken;

  res.json({ message: "Email verified successfully. You can now log in." });
});

router.post("/resend-verification", async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.verified)
    return res.status(400).json({ error: "User already verified" });

  user.verificationToken = uuidv4();
  const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:4000"}/api/users/verify-email?token=${user.verificationToken}`;

  try {
    await transporter.sendMail({
      from: `"Support" <no-reply@example.com>`,
      to: user.email,
      subject: "Verify your email",
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });
    res.json({ message: "Verification email resent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to resend email" });
  }
});

export default router;
