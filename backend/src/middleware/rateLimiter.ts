import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import logger from "../logger";

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later."
    });
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    logger.warn("Auth rate limit exceeded", {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts, please try again later."
    });
  }
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many API requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("API rate limit exceeded", {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      success: false,
      message: "Too many API requests, please try again later."
    });
  }
});

