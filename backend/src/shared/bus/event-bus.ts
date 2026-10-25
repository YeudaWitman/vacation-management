import { Class, MessageHandler } from "./types";

// An event is a fact that already happened, so it cannot be refused.
// An event type can have many listeners (logging, notifications...). They only react.
export class EventBus {
  private listeners = new Map<Function, MessageHandler<any>[]>();

  subscribe<T extends object>(event: Class<T>, listener: MessageHandler<T>): void {
    const list = this.listeners.get(event) ?? [];
    list.push(listener);
    this.listeners.set(event, list);
  }

  // The data is already saved when an event is published, so a failing listener must not
  // turn a successful command into an error. We log the failure and carry on with the rest.
  // Events are in memory: nothing retries a failed listener (see README, known limitations).
  async publish(event: object): Promise<void> {
    for (const listener of this.listeners.get(event.constructor) ?? []) {
      try {
        await listener(event);
      } catch (err) {
        console.error(`Listener failed for ${event.constructor.name}`, err);
      }
    }
  }
}
