import { Class, MessageHandler } from "./types";

// A command is a request to do something that has NOT happened yet, so it can be refused.
// Every command type has exactly one handler: that handler holds the business rules.
export class CommandBus {
  private handlers = new Map<Function, MessageHandler<any>>();

  register<T extends object, R = unknown>(
    command: Class<T>,
    handler: (command: T) => Promise<R> | R
  ): void {
    if (this.handlers.has(command)) {
      throw new Error(`A handler is already registered for ${command.name}`);
    }
    this.handlers.set(command, handler);
  }

  // Finds the handler by the command's class and returns whatever the handler returns.
  // Errors thrown by the handler (e.g. ConflictError) reach the caller unchanged.
  async dispatch<R = unknown>(command: object): Promise<R> {
    const handler = this.handlers.get(command.constructor);
    if (!handler) {
      throw new Error(`No handler registered for ${command.constructor.name}`);
    }
    return (await handler(command)) as R;
  }
}
