import { Logger } from '../logger/index.mjs';

export function handleUncaughtExceptions(
  logger: Logger,
  exit: boolean = false,
  callback?: () => void,
): NodeJS.UncaughtExceptionListener {
  return function (error: Error, origin: NodeJS.UncaughtExceptionOrigin): void {
    logger.fatal('Caught exception by global handler', { error, origin });
    if (callback) {
      callback();
    }
    if (exit) {
      process.exit(-1);
    }
  };
}
