import { Logger } from '../logger/index.mjs';
import { handlePromiseRejections } from './handle-promise-rejections.mjs';
import { handleUncaughtExceptions } from './handle-uncaught-exceptions.mjs';

export function handleGlobalErrors(logger: Logger, exit: boolean = false, callback?: () => void) {
  process.on('uncaughtException', handleUncaughtExceptions(logger, exit, callback));
  process.on('unhandledRejection', handlePromiseRejections(logger, exit, callback));
}
