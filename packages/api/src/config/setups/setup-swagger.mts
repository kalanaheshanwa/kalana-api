import { Router } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { AppContext } from '../../types/index.mjs';
import BlogCreate from './swagger-schemas/blog-create.schema.json' with { type: 'json' };
import CategoryCreate from './swagger-schemas/category-create.schema.json' with { type: 'json' };
import ContactSubmission from './swagger-schemas/contact-submission.schema.json' with { type: 'json' };
import PortfolioCreate from './swagger-schemas/portfolio-create.schema.json' with { type: 'json' };

const router = Router({ strict: true });

export function setupSwagger({ config }: AppContext) {
  const spec = swaggerJSDoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: `Kalanah API (${config.NODE_ENV})`,
        version: '1.0.0',
      },
      components: {
        schemas: {
          ContactSubmission,
          BlogCreate,
          CategoryCreate,
          PortfolioCreate,
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
