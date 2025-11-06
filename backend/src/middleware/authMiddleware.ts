import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// For legacy support in /api/users route expecting 'protect' 
export const protect = authenticate;

// Role-based guard
export const authorizeRole = (role: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};