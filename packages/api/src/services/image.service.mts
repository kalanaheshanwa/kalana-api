import { ImageListQuerySchema } from '../schemas/index.mjs';
import { AppContext } from '../types/index.mjs';
import { appError, AppErrorCode, pagination } from '../utils/index.mjs';
import { UploadService } from './upload.service.mjs';

export class ImageService {
  private readonly _upload: UploadService;
  readonly #db: AppContext['db'];

  constructor(context: AppContext) {
    this._upload = new UploadService(context);
    this.#db = context.db;
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

  async addToBucket(files: Express.Multer.File[]) {
    return this.#db
      .transaction()
      .setIsolationLevel('repeatable read')
      .execute(async (trx) => {
        const urls = await Promise.all(
          files.map(async (file) => {
            const key = `kalanah/bucket/${Date.now()}-${file.originalname}`;
            const url = await this._upload.s3(key, file.buffer, file.mimetype);

            if (!url) {
              throw appError(500, 'Uploading failed', AppErrorCode.INTERNAL_SERVER_ERROR);
            }

            return url;
          }),
        );

        return trx
          .insertInto('images')
          .values(urls.map((u) => ({ url: u })))
          .returningAll()
          .execute();
      });
  }

  async listBucket(input: ImageListQuerySchema) {
    let query = this.#db.selectFrom('images as i').selectAll();

    if (input.after) {
      query = query.where('i.id', '>', input.after);
    }

    query = query
      .orderBy('i.createdAt', 'desc')
      .orderBy('i.id', 'asc')
      .limit(input.limit + 1);

    return pagination(await query.execute(), input.limit);
  }
}
