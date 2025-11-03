import { NextFunction, Request, RequestHandler, Response } from 'express';

export function asyncMiddleware(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return void (await handler(req, res, next));
    } catch (error) {
      return next(error);
    }
  };
}
