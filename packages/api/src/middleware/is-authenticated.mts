import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { SimpleFetcher } from 'aws-jwt-verify/https';
import { SimpleJwksCache } from 'aws-jwt-verify/jwk';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppContext } from '../types/index.mjs';
import { appError, AppErrorCode } from '../utils/index.mjs';

type Verifier = ReturnType<typeof CognitoJwtVerifier.create>;
type JwksCache = SimpleJwksCache;

let cachedVerifier: Verifier | null = null;
let cachedJwksCache: JwksCache | null = null;

function getJwksCache(config: AppContext['config']): JwksCache {
  if (!cachedJwksCache) {
    const fetcher = new SimpleFetcher({
      defaultRequestOptions: {
        timeout: config.APP_AWS_COGNITO_JWKS_TIMEOUT_MS,
        responseTimeout: config.APP_AWS_COGNITO_JWKS_TIMEOUT_MS,
      },
    });

    cachedJwksCache = new SimpleJwksCache({ fetcher });
  }

  return cachedJwksCache;
}

function getVerifier(config: AppContext['config']): Verifier {
  if (!cachedVerifier) {
    cachedVerifier = CognitoJwtVerifier.create({
      userPoolId: config.APP_AWS_COGNITO_USER_POOL_ID,
      tokenUse: 'access',
      clientId: config.APP_AWS_COGNITO_CLIENT_IDS,
    }, { jwksCache: getJwksCache(config) });
  }

  return cachedVerifier;
}

export function isAuthenticated({ config }: AppContext): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.header('authorization');
      if (!authHeader) {
        return next(appError(401, 'Missing auth header', AppErrorCode.UNAUTHORIZED));
      }

      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        return next(appError(401, 'Auth header is malformed', AppErrorCode.UNAUTHORIZED));
      }

      const verifier = getVerifier(config);
      await verifier.verify(token);

      return next();
    } catch (error) {
      console.error(error);
      return next(appError(401, 'Unauthorized', AppErrorCode.UNAUTHORIZED, { error }));
    }
  };
}
