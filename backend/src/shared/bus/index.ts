import { CommandBus } from "./command-bus";
import { EventBus } from "./event-bus";

// One shared instance of each bus for the whole app. Everyone imports these two objects
// from here, so a handler registered in one file is found when another file dispatches.
export const commandBus = new CommandBus();
export const eventBus = new EventBus();

export { CommandBus, EventBus };
