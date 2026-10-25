import { eventBus } from "../shared/bus";
import {
  VacationRequestApprovedEvent,
  VacationRequestCreatedEvent,
  VacationRequestRejectedEvent,
} from "../modules/vacation-requests/vacation-request.events";

// An event listener reacts to a fact that already happened. It never decides anything:
// the business rules live in the command handlers, and by the time a listener runs the data
// is already saved. That is why the listener can be added (or removed) without touching
// any rule: this is the open/closed idea behind the command and event layer.
//
// This one writes an audit trail to the console: who and what changed, and when.
// In a real system the same place could send an email, write to an audit table or
// push the event to a queue, each as one more small listener.
//
// If a listener throws, the event bus logs the error and carries on: a failing log line
// must never turn a successful approval into an error for the user.

function audit(message: string) {
  console.log(`[audit] ${new Date().toISOString()} ${message}`);
}

// Called once at startup from bootstrap.ts.
export function registerAuditLogListeners(): void {
  eventBus.subscribe(VacationRequestCreatedEvent, (event) =>
    audit(`request ${event.requestId} created by user ${event.userId} (${event.startDate} to ${event.endDate})`)
  );

  eventBus.subscribe(VacationRequestApprovedEvent, (event) =>
    audit(`request ${event.requestId} of user ${event.userId} approved`)
  );

  eventBus.subscribe(VacationRequestRejectedEvent, (event) =>
    audit(`request ${event.requestId} of user ${event.userId} rejected: "${event.comment}"`)
  );
}
