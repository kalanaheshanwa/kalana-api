import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../middleware/index.mjs';
import { AppContext } from '../../../types/index.mjs';
import { submissionSchema } from './schemas/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  /**
   * @openapi
   * /api/v1/contact:
   *   post:
   *     tags:
   *       - Contact
   *     summary: Creates a contact submission
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/ContactSubmission"
   *     responses:
   *       201:
   *         description: Creates an entry in contact submissions
   */
  router.post(
    '/',
    validateSchema(submissionSchema),
    asyncMiddleware(async (req, res) => {
      return res.status(201).json({ data: 'hello' });
    }),
  );

  return router;
}
