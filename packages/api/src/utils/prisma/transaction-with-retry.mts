import { Prisma } from '@prisma/client';
import { backOff, BackoffOptions } from 'exponential-backoff';
import { ArgsType } from '../../types/index.mjs';
import { Logger } from '../logger/index.mjs';

export const txWithRetryExtension = (logger: Logger, options: BackoffOptions = { jitter: 'full', numOfAttempts: 5 }) =>
  Prisma.defineExtension((prisma) =>
    prisma.$extends({
      client: {
        $transaction(...args: ArgsType<typeof prisma.$transaction>) {
          return backOff(() => prisma.$transaction(...args), {
            retry: (error, attemptNumber) => {
              logger.warn(`Transaction failed: Retrying attempt: ${attemptNumber} of ${options.numOfAttempts}`, {
                error,
              });
              return error.code === 'P2034';
            },
            ...options,
          });
        },
      },
    }),
  );
