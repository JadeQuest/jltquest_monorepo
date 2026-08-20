import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { ErrorCode } from '@jlt/constants';

type Location = 'body' | 'query' | 'params';

interface MultiLocationSchema {
  body?: ZodType<any>;
  query?: ZodType<any>;
  params?: ZodType<any>;
}

export const validateRequest = (
  schemaOrConfig: ZodType<any> | MultiLocationSchema,
  defaultLocation: Location = 'body'
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (
        'body' in schemaOrConfig ||
        'query' in schemaOrConfig ||
        'params' in schemaOrConfig
      ) {
        const config = schemaOrConfig as MultiLocationSchema;
        if (config.body) {
          req.body = await config.body.parseAsync(req.body);
        }
        if (config.query) {
          req.query = await config.query.parseAsync(req.query) as any;
        }
        if (config.params) {
          req.params = await config.params.parseAsync(req.params) as any;
        }
      } else {
        const schema = schemaOrConfig as ZodType<any>;
        const target = req[defaultLocation];
        const parsed = await schema.parseAsync(target);
        req[defaultLocation] = parsed;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => `${e.path.join('.') || defaultLocation}: ${e.message}`).join(', ');
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
