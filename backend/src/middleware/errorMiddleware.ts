import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = res.getHeader("x-request-id") || "unknown";
  const errorData = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    statusCode: err.status || err.statusCode || 500,
    errorName: err.name || "Error",
    errorMessage: err.message || "Internal server error",
    stack: err.stack,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get("user-agent"),
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString()
  };

  logger.error("Request Error", errorData);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    requestId,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
}