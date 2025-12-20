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
      .select(['cs.id', 'cs.email', 'cs.name', 'cs.subject', 'cs.createdAt']);

    // if (input.after) {
    //   const cursorTuple = decodeCursor<Pick<Selectable<ContactSubmission>, 'createdAt' | 'id'>>(input.after);
    //   query = query.where(({ eb, tuple, refTuple }) =>
    //     eb(refTuple('cs.createdAt', 'cs.id'), '<', tuple(cursorTuple.createdAt, cursorTuple.id)),
    //   );
    // }

    // query = query
    //   .orderBy('cs.createdAt', 'desc')
    //   .orderBy('cs.id', 'desc')
    //   .limit(input.limit + 1);

    // return pagination(await query.execute(), ['createdAt', 'id'], input.limit);

    return paginate(
      query,
      { col: 'cs.createdAt', direction: 'desc', output: 'createdAt' },
      { col: 'cs.id', output: 'id' },
      input.limit,
      input.after,
    ).execute();
  }
}
