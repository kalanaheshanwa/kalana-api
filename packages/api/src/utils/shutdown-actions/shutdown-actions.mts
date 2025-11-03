export class ShutdownActionsMiddleware {
  readonly #actions: ShutdownAction[] = [];

  constructor() {
    this.#init();
  }

  push(action: ShutdownAction) {
    this.#actions.push(action);
  }

  #init(): void {
    process.addListener('SIGINT', this.#gracefulShutdown);
    process.addListener('SIGTERM', this.#gracefulShutdown);
  }

  async #gracefulShutdown() {
    for (const action of this.#actions) {
      await action();
    }
    process.exit(0);
  }
}

export interface ShutdownAction {
  (): void | Promise<void>;
}
