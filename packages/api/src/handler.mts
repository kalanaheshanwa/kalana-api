import { configure as serverlessExpress } from '@codegenie/serverless-express';
import { Express } from 'express';
import { getConfig } from './config/index.mjs';
import { main } from './index.mjs';
import { Logger } from './utils/index.mjs';

const logger = new Logger({ context: 'bootstrap' });

async function bootstrap(): Promise<Express> {
  const config = getConfig();

  return main(config);
}

const app = await bootstrap().catch((error) => {
  logger.error(error);
  process.exit(-1);
});

export const handler = serverlessExpress({ app });
