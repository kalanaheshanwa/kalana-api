import { ReferenceExpression, SelectQueryBuilder } from 'kysely';
import _ from 'lodash';
import { DB } from '../../generated/kysely/schema.js';

/**
 * @deprecated - Use PaginateQueryBuilder
 */
export class Pagination<T extends Record<string, unknown>> {
  readonly #list: T[];
  readonly #limit: number;
  readonly #tuple: (keyof T)[];
  readonly #nodes: T[];

  constructor(list: T[], tuple: (keyof T)[], limit: number) {
    this.#list = list;
    this.#limit = limit;
    this.#tuple = tuple;

    this.#nodes = list.slice(0, limit);
  }

  get nodes(): T[] {
    return this.#nodes;
  }

  get hasNext(): boolean {
    return this.#list.length > this.#limit;
  }

  get nextCursor(): string | null {
    if (!this.hasNext) {
      return null;
    }

    const excludedNode = this.#nodes[this.#nodes.length - 1];
    return this.#encodeCursor(_.pick(excludedNode, this.#tuple));
  }

  #encodeCursor<T extends object>(tuple: T): string {
    const cursorData = JSON.stringify(tuple);
    return Buffer.from(cursorData).toString('base64');
  }

  toJSON() {
    return {
      nodes: this.nodes,
      pagination: {
        hasNext: this.hasNext,
        nextCursor: this.nextCursor,
      },
    };
  }
}

/**
 * @deprecated - Use paginate
 */
export function pagination<T extends { id: string | number }>(
  list: T[],
  tuple: (keyof T)[],
  limit: number,
): Pagination<T> {
  return new Pagination(list, tuple, limit);
}

export class PaginateQueryBuilder<D extends DB, T extends keyof D, O> {
  readonly #query: SelectQueryBuilder<D, T, O>;
  readonly #orderBy: { col: ReferenceExpression<D, T>; direction: 'asc' | 'desc'; output: string };
  readonly #pk: { col: ReferenceExpression<D, T>; output: string };
  readonly #limit: number;
  readonly #after?: string;

  #result: O[] = [];

  constructor(
    query: SelectQueryBuilder<D, T, O>,
    orderBy: { col: ReferenceExpression<D, T>; direction: 'asc' | 'desc'; output: string },
    pk: { col: ReferenceExpression<D, T>; output: string },
    limit: number,
    after?: string,
  ) {
    this.#query = query;
    this.#orderBy = orderBy;
    this.#pk = pk;
    this.#limit = limit;
    this.#after = after;
  }

  get nodes() {
    return this.#result.slice(0, this.#limit);
  }

  get hasNext(): boolean {
    return this.#result.length > this.#limit;
  }

  get nextCursor(): string | null {
    if (!this.hasNext) {
      return null;
    }

    const lastNode = this.nodes[this.nodes.length - 1];
    return this.#encodeCursor(_.pick(lastNode, [this.#orderBy.output, this.#pk.output]));
  }

  toJSON() {
    return {
      nodes: this.nodes,
      pagination: {
        hasNext: this.hasNext,
        nextCursor: this.nextCursor,
      },
    };
  }

  async execute() {
    this.#result = await this.#build().execute();
    return this;
  }

  #build(): SelectQueryBuilder<D, T, O> {
    let q = this.#query;

    if (this.#after) {
      const cursorTuple = this.#decodeCursor<Record<string, unknown>>(this.#after);
      q = q.where(({ eb, tuple, refTuple }) =>
        eb(
          refTuple(this.#orderBy.col, this.#pk.col),
          '<',
          tuple(cursorTuple[this.#orderBy.output], cursorTuple[this.#pk.output]),
        ),
      );
    }

    q = q.orderBy(this.#orderBy.col, this.#orderBy.direction).orderBy(this.#pk.col, this.#orderBy.direction);
    q = q.limit(this.#limit + 1);

    return q;
  }

  #decodeCursor<T extends object>(cursor: string): T {
    const json = Buffer.from(cursor, 'base64').toString('utf8');
    return JSON.parse(json);
  }

  #encodeCursor<T extends object>(tuple: T): string {
    const cursorData = JSON.stringify(tuple);
    return Buffer.from(cursorData).toString('base64');
  }
}

export function paginate<D extends DB, T extends keyof D, O>(
  query: SelectQueryBuilder<D, T, O>,
  orderBy: { col: ReferenceExpression<D, T>; direction: 'asc' | 'desc'; output: string },
  pk: { col: ReferenceExpression<D, T>; output: string },
  limit: number,
  after?: string,
): PaginateQueryBuilder<D, T, O> {
  return new PaginateQueryBuilder(query, orderBy, pk, limit, after);
}
