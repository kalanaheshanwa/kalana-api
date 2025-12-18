import * as db from 'zapatos/db';
import type * as s from 'zapatos/schema';
import { ContactSubmissionSchema } from '../schemas/index.mjs';
import { AppContext } from '../types/index.mjs';

export class ContactService {
  private readonly pool: AppContext['pool'];

  constructor({ pool }: AppContext) {
    this.pool = pool;
  }

  create(data: ContactSubmissionSchema): Promise<s.contact_submissions.JSONSelectable> {
    return db.insert('contact_submissions', data).run(this.pool);
  }

  list(): Promise<s.contact_submissions.Selectable[]> {
    return db.sql<s.contact_submissions.SQL, s.contact_submissions.Selectable[]>`
      SELECT * FROM ${'contact_submissions'}
    `.run(this.pool);
  }
}
