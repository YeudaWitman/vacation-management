// Runs once at startup (imported by index.ts). This is where command handlers are registered
// and event listeners are subscribed, so the buses are ready before the first request.
import { commandBus } from "./shared/bus";
import {
  ApproveVacationRequestCommand,
  CreateVacationRequestCommand,
  RejectVacationRequestCommand,
} from "./modules/vacation-requests/vacation-request.commands";
import { handleCreateVacationRequest } from "./modules/vacation-requests/create-vacation-request.command-handler";
import {
  handleApproveVacationRequest,
  handleRejectVacationRequest,
} from "./modules/vacation-requests/review-vacation-request.command-handlers";
import { registerAuditLogListeners } from "./listeners/audit-log.listener";

commandBus.register(CreateVacationRequestCommand, handleCreateVacationRequest);
commandBus.register(ApproveVacationRequestCommand, handleApproveVacationRequest);
commandBus.register(RejectVacationRequestCommand, handleRejectVacationRequest);

// Event listeners: they react after a command succeeded. See listeners/audit-log.listener.ts.
registerAuditLogListeners();
