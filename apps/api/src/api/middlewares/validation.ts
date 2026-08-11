import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ErrorCode } from '@jlt/constants';

export const validateRequest = (
  schema: AnyZodObject,
  location: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const target = req[location];
      const parsed = await schema.parseAsync(target);
      req[location] = parsed; // Re-assign validated data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next({
          code: ErrorCode.INVALID_INPUT,
          message: `Validation failed: ${issues}`,
          status: 400
        });
      }
      next(error);
    }
  };
};
