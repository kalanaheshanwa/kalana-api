import path from 'path';
import winston from 'winston';
// import 'winston-daily-rotate-file';

/**
 * Logger class provides a structured logging mechanism using winston.
 * It supports multiple log levels: fatal, error, warn, info, and debug.
 * Logs can be output to both console and daily rotated files.
 *
 * @remarks
 * - Default log level is 'debug'.
 * - Log files are rotated daily and archived for 14 days.
 * - Supports custom metadata for each log entry.
 *
 * @param meta - Metadata to associate with the logger instance.
 */
export class Logger {
  private static readonly _defaultOptions: winston.LoggerOptions = {
    level: 'debug',
    levels: {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
    },
    transports: [
      /**
       * new winston.transports.DailyRotateFile({
       *   level: 'warn',
       *   format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
       *   filename: path.join(process.cwd(), 'logs', '%DATE%.log'),
       *   datePattern: 'YYYY-MM-DD-HH',
       *   utc: true,
       *   zippedArchive: true,
       *   maxSize: '20m',
       *   maxFiles: '14d',
       * }),
       */
      new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.simple()),
      }),
    ],
  };
  private static _parentLogger: winston.Logger;

  private readonly _logger: winston.Logger;

  constructor(meta?: LoggerMetadata) {
    if (!Logger._parentLogger) {
      winston.addColors({
        fatal: 'bold white redBG',
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        debug: 'green',
      });

      Logger._parentLogger = winston.createLogger(Object.assign(Object.create(null), Logger._defaultOptions));
    }

    this._logger = Logger._parentLogger.child(
      Object.assign(Object.create(null), meta, {
        context: meta?.context ?? this._getCallerRelativePath(),
      }),
    );
  }

  /**
   * Configures the parent logger with the specified options.
   *
   * @param options - The configuration options for the logger.
   */
  static setOptions(options: winston.LoggerOptions) {
    Logger._parentLogger.configure(Object.assign(Object.create(null), Logger._defaultOptions, options));
  }

  private _log(level: string, message: string, meta: Record<string, unknown> = {}) {
    this._logger.log(level, message, this._refineMetadata(meta));
  }

  /**
   * Logs a debug-level message with optional metadata.
   *
   * @param message - The debug message to log.
   * @param meta - Additional metadata to include with the log entry.
   */
  debug(message: string, meta: Record<string, unknown> = {}): void {
    this._log('debug', message, meta);
  }

  /**
   * Logs an info-level message with optional metadata.
   *
   * @param message - The informational message to log.
   * @param meta - Additional metadata to include with the log entry.
   */
  info(message: string, meta: Record<string, unknown> = {}): void {
    this._log('info', message, meta);
  }

  /**
   * Logs an info-level message with optional metadata.
   *
   * @param message - The informational message to log.
   * @param meta - Additional metadata to include with the log entry.
   */
  log(message: string, meta: Record<string, unknown> = {}): void {
    this._log('info', message, meta);
  }

  /**
   * Logs a warning-level message with optional metadata.
   *
   * @param message - The warning message to log.
   * @param meta - Additional metadata to include with the log entry.
   */
  warn(message: string, meta: Record<string, unknown> = {}): void {
    this._log('warn', message, meta);
  }

  /**
   * Logs an error-level message with optional metadata.
   *
   * @param message - The error message to log.
   * @param meta - Additional metadata to include with the log entry.
   */
  error(message: string, meta: Record<string, unknown> = {}): void {
    this._log('error', message, meta);
  }

  /**
   * Logs a fatal-level message with optional metadata.
   *
   * @param message - The fatal message to log.
   * @param meta - Additional metadata to include with the log entry.
   */
  fatal(message: string, meta: Record<string, unknown> = {}): void {
    this._log('fatal', message, meta);
  }

  private _getCallerRelativePath(): string {
    const error = new Error();
    const originalPrepareStackTrace = Error.prepareStackTrace;

    try {
      Error.prepareStackTrace = (_, stack) => stack;
      const stack = error.stack as unknown as NodeJS.CallSite[];
      Error.prepareStackTrace = originalPrepareStackTrace;

      // Skip the first two frames (Error constructor and Logger constructor)
      const callerSite = stack[2];
      if (callerSite) {
        const callerFilePath = callerSite.getFileName() || 'unknown';
        return path.relative(path.join(process.cwd()), callerFilePath.replace('file:///', ''));
      }

      throw new Error('Unable to determine caller file path');
    } catch (err) {
      Error.prepareStackTrace = originalPrepareStackTrace;
      throw err;
    }
  }

  private _refineMetadata(meta: Record<string, unknown>): Record<string, unknown> | null {
    const keys = Object.keys(meta);
    for (const key of keys) {
      if (meta[key] instanceof Error) {
        meta[key] = {
          stack: meta[key].stack,
          message: meta[key].message,
          name: meta[key].name,
        };
      }
    }

    return keys.length > 0 ? { meta } : null;
  }
}

interface LoggerMetadata {
  context?: string;
}
