import cors from 'cors';
import express, { ErrorRequestHandler, Express } from 'express';
import api from './api/index.mjs';
import { AppConfig } from './config/index.mjs';
import { setupAWSServices, setupDb, setupSwagger } from './config/setups/index.mjs';
import { AppContext } from './types/index.mjs';
import { AppError, Logger, ShutdownActionsMiddleware } from './utils/index.mjs';

const logger = new Logger({ context: 'main' });

export async function main(config: AppConfig): Promise<Express> {
  const shutdownActions = new ShutdownActionsMiddleware();

  const { pool, dispose, db } = await setupDb(config);
  const { s3 } = await setupAWSServices(config);

  shutdownActions.push(dispose);

  const context: AppContext = { config, pool, db, s3 };

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

  logger.error('Handler threw an unexpected error', { error });
  return void res.status(500).json({ error });
}
