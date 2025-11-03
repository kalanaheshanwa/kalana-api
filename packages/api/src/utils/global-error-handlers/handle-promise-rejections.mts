import { Logger } from '../logger/index.mjs';

export function handlePromiseRejections(
  logger: Logger,
  exit: boolean = false,
  callback?: () => void,
): NodeJS.UnhandledRejectionListener {
  return function (reason: unknown, promise: Promise<unknown>): void {
    logger.fatal('Rejection handled by global handler', { reason, promise });
    if (callback) {
      callback();
    }
    if (exit) {
      process.exit(-1);
    }
  };
}
