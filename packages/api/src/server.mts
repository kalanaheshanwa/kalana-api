import http from 'http';
import { getConfig } from './config/index.mjs';
import { main } from './index.mjs';
import { handleGlobalErrors, Logger } from './utils/index.mjs';

const logger = new Logger({ context: 'bootstrap' });

async function bootstrap(): Promise<void> {
  const config = getConfig();

  const app = await main(config);
  const httpServer = http.createServer(app);

  await new Promise<void>((resolve) => httpServer.listen({ port: config.PORT }, resolve));
  logger.info(`🚀 Server ready at http://localhost:${config.PORT}/`);
}

handleGlobalErrors(new Logger({ context: 'global-error-handler' }));

bootstrap().catch(async (error) => {
  logger.error(error);
  process.kill(process.pid, 'SIGTERM');
});
