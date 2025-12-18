import { Router } from 'express';
import { asyncMiddleware, uploadMiddleware } from '../../../../middleware/index.mjs';
import { ImageService } from '../../../../services/index.mjs';
import { AppContext } from '../../../../types/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _image = new ImageService(context);

  /**
   * @openapi
   * /api/v1/admin/images/{type}/{id}:
   *   post:
   *     tags:
   *       - Images
   *       - Admin
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
      const type = req.params.type as 'portfolio' | 'blog';
      const id = req.params.id;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
      }

      const urls = await _image.upload(type, id, files);

      return res.status(200).json({ data: urls });
    }),
  );

  return router;
}
