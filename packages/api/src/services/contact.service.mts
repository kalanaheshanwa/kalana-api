import { ContactSubmission, PrismaClient } from '#prisma/client';
import { ContactSubmissionSchema } from '../api/v1/contact/schemas/index.mjs';
import { AppContext } from '../types/index.mjs';

export class ContactService {
  private readonly _db: PrismaClient;

  constructor({ db }: AppContext) {
    this._db = db;
  }

  create(data: ContactSubmissionSchema): Promise<ContactSubmission> {
    return this._db.contactSubmission.create({ data });
  }
}
