import { Prisma, PrismaClient } from '#prisma/client';
import cors from 'cors';
import express, { ErrorRequestHandler, Express } from 'express';
import api from './api/index.mjs';
import { AppConfig } from './config/index.mjs';
import { setupSwagger } from './config/setups/index.mjs';
import { AppContext } from './types/index.mjs';
import {
  appError,
  AppError,
  AppErrorCode,
  Logger,
  ShutdownActionsMiddleware,
  txWithRetryExtension,
} from './utils/index.mjs';

const logger = new Logger({ context: 'main' });

export async function main(config: AppConfig): Promise<Express> {
  const shutdownActions = new ShutdownActionsMiddleware();

  const prisma = new PrismaClient();
  const prismaExtended = prisma.$extends(txWithRetryExtension(new Logger({ context: 'setupPrisma' })));
  await prisma.$connect();

  shutdownActions.push(async () => {
    await prismaExtended.$disconnect();
  });

  const context: AppContext = { config, db: prismaExtended as unknown as PrismaClient };

  const app = express();
  app.use(cors({ origin: config.CORS_ALLOWED_ORIGINS }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', api(context));
  app.use('/docs', setupSwagger(context));

  app.use(errorHandler);

  return app;
}

function errorHandler(
  error: unknown,
  req: express.Request,
  res: express.Response,
  _: express.NextFunction,
): ReturnType<ErrorRequestHandler> {
  if (error instanceof AppError) {
    return void res.status(error.httpCode).json({ error });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return void res.status(404).json({ error: appError(404, error.message, AppErrorCode.NOT_FOUND) });
    } else if (error.code === 'P2023') {
      return void res.status(404).json({ error: appError(404, error.message, AppErrorCode.NOT_FOUND) });
    }
  }

  logger.error('Handler threw an unexpected error', { error });
  return void res.status(500).json({ error });
}
