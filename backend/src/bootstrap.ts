// Runs once at startup (imported by index.ts). This is where command handlers are registered
// and event listeners are subscribed, so the buses are ready before the first request.
import { commandBus } from "./shared/bus";
import { CreateVacationRequestCommand } from "./modules/vacation-requests/vacation-request.commands";
import { handleCreateVacationRequest } from "./modules/vacation-requests/create-vacation-request.command-handler";

commandBus.register(CreateVacationRequestCommand, handleCreateVacationRequest);
