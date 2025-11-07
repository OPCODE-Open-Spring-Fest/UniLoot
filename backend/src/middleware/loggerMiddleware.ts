import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      "%s %s %d %dms",
      req.method,
      req.originalUrl,
      res.statusCode,
      duration
    );
  });
  next();
};