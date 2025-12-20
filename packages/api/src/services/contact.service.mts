import { ContactListQuerySchema, ContactSubmissionSchema } from '../schemas/index.mjs';
import { AppContext } from '../types/index.mjs';
import { paginate } from '../utils/index.mjs';

export class ContactService {
  readonly #db: AppContext['db'];

  constructor({ db }: AppContext) {
    this.#db = db;
  }

  create(data: ContactSubmissionSchema) {
    return this.#db.insertInto('contact_submissions').values(data).returningAll().execute();
  }

  async list(input: ContactListQuerySchema) {
    let query = this.#db
      .selectFrom('contact_submissions as cs')
      .select(['cs.id', 'cs.email', 'cs.name', 'cs.subject', 'cs.read', 'cs.createdAt']);

    return paginate(
      query,
      { col: 'cs.createdAt', direction: 'desc', output: 'createdAt' },
      { col: 'cs.id', output: 'id' },
      input.limit,
      input.after,
    ).execute();
  }

  getById(id: string) {
    return this.#db
      .selectFrom('contact_submissions as cs')
      .select(['cs.id', 'cs.email', 'cs.name', 'cs.subject', 'cs.message', 'cs.read', 'cs.createdAt'])
      .where('id', '=', id)
      .executeTakeFirst();
  }

  setRead(id: string) {
    return this.#db.updateTable('contact_submissions').set('read', true).where('id', '=', id).executeTakeFirstOrThrow();
  }
}
