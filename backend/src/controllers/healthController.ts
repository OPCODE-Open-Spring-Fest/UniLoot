import { Request, Response, NextFunction } from 'express';

export const healthCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).json({ status: 'ok' });// Responds with { status: "ok" } if server is running
  } catch (error) {
    next(error);
  }
};