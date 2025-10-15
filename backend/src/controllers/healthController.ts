import { Request, Response, NextFunction } from 'express';
 //Responds with { status: "ok" } if server is running
export const healthCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // will Simulate async if needed for check DB connection)
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};