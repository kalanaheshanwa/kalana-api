import { AppErrorCode } from './error-codes.mjs';

export class AppError {
  constructor(
    public readonly httpCode: number,
    public readonly message: string,
    public readonly code: AppErrorCode,
    public readonly details?: Record<string, unknown>,
  ) {}
}

export function appError(httpCode: number, message: string, code: AppErrorCode, details?: Record<string, unknown>) {
  return new AppError(httpCode, message, code, details);
}
