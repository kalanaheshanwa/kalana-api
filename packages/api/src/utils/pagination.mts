export class Pagination<T extends { id: string | number }> {
  readonly #list: T[];
  readonly #limit: number;
  readonly #nodes: T[];

  constructor(list: T[], limit: number) {
    this.#list = list;
    this.#limit = limit;

    this.#nodes = list.slice(0, limit);
  }

  get nodes(): T[] {
    return this.#nodes;
  }

  get hasNext(): boolean {
    return this.#list.length > this.#limit;
  }

  get nextCursor(): string | null {
    return this.hasNext ? String(this.#nodes[this.#nodes.length - 1].id) : null;
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

export function pagination<T extends { id: string | number }>(list: T[], limit: number): Pagination<T> {
  return new Pagination(list, limit);
}
