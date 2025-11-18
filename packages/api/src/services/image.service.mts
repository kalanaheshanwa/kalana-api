import { AppContext } from '../types/index.mjs';
import { appError, AppErrorCode } from '../utils/index.mjs';
import { UploadService } from './upload.service.mjs';

export class ImageService {
  private readonly _upload: UploadService;

  constructor(context: AppContext) {
    this._upload = new UploadService(context);
  }

  async upload(type: 'portfolio' | 'blog', id: string, files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(
      files.map(async (file) => {
        const key = `kalanah/${type}/${id}/${Date.now()}-${file.originalname}`;
        const url = await this._upload.s3(key, file.buffer, file.mimetype);

        if (!url) {
          throw appError(500, 'Uploading failed', AppErrorCode.INTERNAL_SERVER_ERROR);
        }

        return url;
      }),
    );
  }
}
