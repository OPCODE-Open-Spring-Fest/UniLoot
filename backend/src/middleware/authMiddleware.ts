import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../controllers/auth';

export interface AuthenticatedRequest extends Request {
    user?: any;
}

export type AuthRequest = AuthenticatedRequest;

// (Middleware file - authMiddleware.ts)

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (!token) {
        // Use 401 for NO credentials (token missing entirely)
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch {
        // Use 403 for INVALID credentials (token present but invalid/expired/rejected)
        // This is often seen as a better status for expired tokens.
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}
export function authorizeRole(role: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
}
