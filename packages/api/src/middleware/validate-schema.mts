import { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';
import { appError, AppErrorCode } from '../utils/index.mjs';

export function validateSchema(schema: z.Schema, prop: 'body' | 'query' = 'body'): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = await schema.parse(req[prop]);

      if (prop === 'body') {
        req.body = value;
      } else if (prop === 'query') {
        Object.defineProperty(req, 'query', {
          value,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      return next();
    } catch (error) {
      return next(appError(400, '1 or more params invalid', AppErrorCode.BAD_USER_INPUT, { error }));
    }
  };
}
