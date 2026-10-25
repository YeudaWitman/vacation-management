// A class we can use as a key, e.g. ApproveVacationRequestCommand (not an instance of it).
export type Class<T> = new (...args: any[]) => T;

// A command handler or an event listener: receives the message, may be async.
export type MessageHandler<T> = (message: T) => Promise<unknown> | unknown;
