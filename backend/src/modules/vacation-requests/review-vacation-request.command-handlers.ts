import { getDataSource } from "../../shared/db/data-source";
import { BadRequestError, ConflictError, NotFoundError } from "../../shared/errors";
import { eventBus } from "../../shared/bus";
import {
  ApproveVacationRequestCommand,
  RejectVacationRequestCommand,
} from "./vacation-request.commands";
import {
  VacationRequestApprovedEvent,
  VacationRequestRejectedEvent,
} from "./vacation-request.events";
import { VacationRequest } from "./vacation-request.entity";

// Loads the request and applies the rule shared by approve and reject:
// only a Pending request can be decided. An Approved or Rejected one is final.
async function loadPending(requestId: number) {
  const repo = (await getDataSource()).getRepository(VacationRequest);
  const request = await repo.findOneBy({ id: requestId });
  if (!request) throw new NotFoundError(`Vacation request ${requestId} not found`);
  if (request.status !== "Pending") {
    throw new ConflictError(`This request is already ${request.status.toLowerCase()} and cannot be changed`);
  }
  return { repo, request };
}

// Changes the status only if the row is STILL Pending. If two validators click at the same
// moment, the second update matches no row, and we answer 409 instead of overwriting.
async function decide(
  requestId: number,
  changes: Pick<VacationRequest, "status"> & Partial<Pick<VacationRequest, "comments">>
): Promise<VacationRequest> {
  const { repo, request } = await loadPending(requestId);
  const result = await repo.update({ id: request.id, status: "Pending" }, changes);
  if (!result.affected) {
    throw new ConflictError("This request was just decided by someone else");
  }
  return repo.findOneByOrFail({ id: request.id });
}

export async function handleApproveVacationRequest(
  command: ApproveVacationRequestCommand
): Promise<VacationRequest> {
  const updated = await decide(command.requestId, { status: "Approved" });
  await eventBus.publish(new VacationRequestApprovedEvent(updated.id, updated.userId));
  return updated;
}

export async function handleRejectVacationRequest(
  command: RejectVacationRequestCommand
): Promise<VacationRequest> {
  // Rule: rejecting needs a comment. Checked here, so every caller gets the same rule.
  const comment = command.comment.trim();
  if (!comment) {
    throw new BadRequestError("A comment is required when rejecting a request");
  }
  const updated = await decide(command.requestId, { status: "Rejected", comments: comment });
  await eventBus.publish(new VacationRequestRejectedEvent(updated.id, updated.userId, comment));
  return updated;
}
