// src/middleware/validateRequest.ts
import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

const validateRequest =
    (schema: ZodObject) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                next();
            } catch (err) {
                return res.status(400).json({
                    message: "Validation failed",
                    err
                    // errors: err.errors.map((e: any) => e.message),
                });
            }
        };

export default validateRequest;
