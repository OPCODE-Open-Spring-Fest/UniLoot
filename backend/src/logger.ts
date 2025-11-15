import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.metadata({ fillExcept: ["message", "level", "timestamp"] })
  ),
  defaultMeta: { service: "uniloot-backend" },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, metadata }) => {
          const metaStr = Object.keys(metadata).length ? JSON.stringify(metadata) : "";
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    }),
    new transports.File({ 
      filename: "application.log",
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    }),
    new transports.File({ 
      filename: "error.log", 
      level: "error",
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    })
  ],
});

export default logger;