import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error("Error: %s %s | %s", req.method, req.originalUrl, err.stack || err);

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}