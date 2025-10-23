import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets missing in environment variables");
}

const accessSecret = process.env.JWT_SECRET as string;
const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

// Define your payload type
export interface TokenPayload extends JwtPayload {
    sub: string;
    username?: string;
    role?: string;
    //role?:"user"|"admin"; // Example roles
}

export function signAccessToken(payload: TokenPayload) {
    const options: SignOptions = { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any };
    
    // --- CRITICAL FIX: Create a clean payload copy ---
    const cleanPayload = { ...payload };
    delete cleanPayload.iat; // Remove "Issued At" claim
    delete cleanPayload.exp; // Remove "Expiration" claim to allow options.expiresIn to work
    // --- END FIX ---

    return jwt.sign(cleanPayload, accessSecret, options);
}

export function signRefreshToken(payload: TokenPayload) {
    const options: SignOptions = { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any };
    
    // --- CRITICAL FIX: Create a clean payload copy ---
    const cleanPayload = { ...payload };
    delete cleanPayload.iat; // Remove "Issued At" claim
    delete cleanPayload.exp; // Remove "Expiration" claim to allow options.expiresIn to work
    // --- END FIX ---

    return jwt.sign(cleanPayload, refreshSecret, options);
}

export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, refreshSecret) as TokenPayload;
}