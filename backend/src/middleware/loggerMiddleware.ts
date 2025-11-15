import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = req.headers["x-request-id"] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get("user-agent"),
      contentLength: res.get("content-length"),
      timestamp: new Date().toISOString()
    };

    if (res.statusCode >= 400) {
      logger.warn("HTTP Request", logData);
    } else {
      logger.info("HTTP Request", logData);
    }
  });

  res.setHeader("X-Request-ID", requestId);
  next();
};