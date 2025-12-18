import { Router } from 'express';
import { asyncMiddleware, uploadMiddleware, validateSchema } from '../../../../middleware/index.mjs';
import { ImageListQuerySchema, imageListQuerySchema } from '../../../../schemas/index.mjs';
import { ImageService } from '../../../../services/index.mjs';
import { AppContext } from '../../../../types/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _image = new ImageService(context);

  /**
   * @openapi
   * /api/v1/admin/images/bucket:
   *   post:
   *     tags:
   *       - Images
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     summary: Add images to the bucket
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               files:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       200:
   *         description: Images added successfully
   */
  router.post(
    '/bucket',
    uploadMiddleware.array('files', 5),
    asyncMiddleware(async (req, res) => {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded.' });
      }

      const images = await _image.addToBucket(files);

      return res.status(200).json({ data: images });
    }),
  );

  /**
   * @openapi
   * /api/v1/admin/images/bucket:
   *   get:
   *     tags:
   *       - Images
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     summary: List all images paginated
   *     parameters:
   *       - name: limit
   *         in: query
   *         description: Number of items to return
   *         required: false
   *         schema:
   *           type: integer
   *           format: int32
   *           minimum: 1
   *           maximum: 20
   *       - name: after
   *         in: query
   *         description: Cursor of the last item
   *         required: false
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List all images paginated
   */
  router.get(
    '/bucket',
    validateSchema(imageListQuerySchema, 'query'),
    asyncMiddleware(async (req, res) => {
      const nodes = await _image.listBucket(req.query as unknown as ImageListQuerySchema);

      return res.status(200).json({ data: nodes });
    }),
  );

  /**
   * @openapi
   * /api/v1/admin/images/{type}/{id}:
   *   post:
   *     tags:
   *       - Images
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     summary: Add images to a resource
   *     parameters:
   *       - in: path
   *         name: type
   *         schema:
   *           enum: ['portfolio', 'blog']
   *         required: true
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               files:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       200:
   *         description: Images added successfully
   */
  router.post(
    '/:type/:id',
    uploadMiddleware.array('files', 5),
    asyncMiddleware(async (req, res) => {
      if (!['portfolio', 'blog'].includes(req.params.type)) {
        return res.status(400).json({ message: 'Invalid image type.' });
      }

      const type = req.params.type as 'portfolio' | 'blog';
      const id = req.params.id;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded.' });
      }

      const urls = await _image.upload(type, id, files);

      return res.status(200).json({ data: urls });
    }),
  );

  return router;
}
