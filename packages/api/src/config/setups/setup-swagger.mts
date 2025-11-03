import { Router } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { AppContext } from '../../types/index.mjs';
import ContactSubmission from './contact-submission.schema.json' with { type: 'json' };

const router = Router({ strict: true });

export function setupSwagger({ config }: AppContext) {
  const spec = swaggerJSDoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: `Elvora Puzzle Store API (${config.NODE_ENV})`,
        version: '1.0.0',
      },
      components: {
        schemas: {
          ContactSubmission,
        },
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
        },
      },
    },
    apis: ['./dist/api/**/*.mjs'],
  });

  router.get('/swagger.json', (_, res) => void res.json(spec));
  router.use('/', swaggerUi.serve, swaggerUi.setup(spec));

  return router;
}
