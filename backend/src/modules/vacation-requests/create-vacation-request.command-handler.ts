import { LessThanOrEqual, MoreThanOrEqual, Not } from "typeorm";
import { getDataSource } from "../../shared/db/data-source";
import { BadRequestError, ConflictError } from "../../shared/errors";
import { todayIso } from "../../shared/dates";
import { eventBus } from "../../shared/bus";
import { CreateVacationRequestCommand } from "./vacation-request.commands";
import { VacationRequestCreatedEvent } from "./vacation-request.events";
import { VacationRequest } from "./vacation-request.entity";

// The command handler holds the business rules. The API handler and the Vue form
// cannot be trusted to enforce them: the backend is the source of truth.
export async function handleCreateVacationRequest(
  command: CreateVacationRequestCommand
): Promise<VacationRequest> {
  // Rules that need only the incoming data.
  if (command.endDate < command.startDate) {
    throw new BadRequestError("End date must not be before the start date");
  }
  if (command.startDate < todayIso()) {
    throw new BadRequestError("Vacation cannot start in the past");
  }

  const repo = (await getDataSource()).getRepository(VacationRequest);

  // Rule that needs the database: no overlap with the same user's other requests.
  // Two ranges overlap when each one starts before (or on the day) the other ends.
  // Rejected requests do not count.
  const overlapping = await repo.findOne({
    where: {
      userId: command.userId,
      status: Not("Rejected"),
      startDate: LessThanOrEqual(command.endDate),
      endDate: MoreThanOrEqual(command.startDate),
    },
  });
  if (overlapping) {
    throw new ConflictError(
      `Overlaps your ${overlapping.status.toLowerCase()} request from ${overlapping.startDate} to ${overlapping.endDate}`
    );
  }

  // create() builds the object in memory, save() writes the row.
  const saved = await repo.save(
    repo.create({
      userId: command.userId,
      startDate: command.startDate,
      endDate: command.endDate,
      reason: command.reason,
      status: "Pending",
    })
  );

  // The request is saved, so now we announce the fact.
  await eventBus.publish(
    new VacationRequestCreatedEvent(saved.id, saved.userId, saved.startDate, saved.endDate)
  );
  return saved;
}
