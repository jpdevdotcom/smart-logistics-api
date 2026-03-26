import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { apiError } from "../utils/api-error";

export const validateBody =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(422)
        .json(
          apiError(
            "VALIDATION_ERROR",
            "Invalid request body.",
            422,
            parsed.error.issues,
          ),
        );
    }

    req.body = parsed.data;
    return next();
  };
