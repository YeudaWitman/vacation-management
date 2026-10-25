import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { repo, resetWorld, recordEvents } from "./helpers/setup";

vi.mock("../src/shared/db/data-source", () => ({
  getDataSource: async () => ({ getRepository: () => repo }),
}));

import {
  handleApproveVacationRequest,
  handleRejectVacationRequest,
} from "../src/modules/vacation-requests/review-vacation-request.command-handlers";
import {
  ApproveVacationRequestCommand,
  RejectVacationRequestCommand,
} from "../src/modules/vacation-requests/vacation-request.commands";
import {
  VacationRequestApprovedEvent,
  VacationRequestRejectedEvent,
} from "../src/modules/vacation-requests/vacation-request.events";
import { BadRequestError, ConflictError, NotFoundError } from "../src/shared/errors";

const approve = (id: number) => handleApproveVacationRequest(new ApproveVacationRequestCommand(id));
const reject = (id: number, comment: string) => handleRejectVacationRequest(new RejectVacationRequestCommand(id, comment));

let events: object[];

beforeEach(() => {
  resetWorld();
  events = recordEvents();
  repo.seed({ userId: 7, startDate: "2026-12-01", endDate: "2026-12-05", status: "Pending" }); // id 1
});
afterEach(() => vi.restoreAllMocks());

describe("ApproveVacationRequest", () => {
  it("approves a Pending request and publishes VacationRequestApprovedEvent", async () => {
    const updated = await approve(1);

    expect(updated.status).toBe("Approved");
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(VacationRequestApprovedEvent);
    expect(events[0]).toMatchObject({ requestId: 1, userId: 7 });
  });

  it("returns 404 for an unknown request", async () => {
    await expect(approve(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(events).toHaveLength(0);
  });

  it("returns 409 when the request is already Approved (cannot be changed)", async () => {
    repo.rows[0].status = "Approved";
    await expect(approve(1)).rejects.toBeInstanceOf(ConflictError);
    expect(events).toHaveLength(0);
  });

  it("returns 409 when the request was already Rejected", async () => {
    repo.rows[0].status = "Rejected";
    await expect(approve(1)).rejects.toBeInstanceOf(ConflictError);
  });

  it("the second of two approves loses the race: 409, one event only", async () => {
    // Both callers passed the "is it Pending?" check. Here the row gets decided by someone
    // else right before our guarded UPDATE runs, so the UPDATE matches zero rows.
    repo.beforeUpdate = () => {
      repo.rows[0].status = "Approved";
    };
    await expect(approve(1)).rejects.toThrow(/just decided by someone else/);
    expect(events).toHaveLength(0);
  });
});

describe("RejectVacationRequest", () => {
  it("rejects a Pending request, stores the trimmed comment and publishes VacationRequestRejectedEvent", async () => {
    const updated = await reject(1, "  Team is short that week  ");

    expect(updated).toMatchObject({ status: "Rejected", comments: "Team is short that week" });
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(VacationRequestRejectedEvent);
    expect(events[0]).toMatchObject({ requestId: 1, userId: 7, comment: "Team is short that week" });
  });

  it.each([[""], ["   "], ["\n\t"]])("requires a comment: %j gives 400 and changes nothing", async (comment) => {
    await expect(reject(1, comment)).rejects.toBeInstanceOf(BadRequestError);
    expect(repo.rows[0].status).toBe("Pending");
    expect(events).toHaveLength(0);
  });

  it("returns 404 for an unknown request", async () => {
    await expect(reject(99, "no")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns 409 when the request is already decided", async () => {
    repo.rows[0].status = "Approved";
    await expect(reject(1, "too late")).rejects.toBeInstanceOf(ConflictError);
    expect(repo.rows[0].status).toBe("Approved");
    expect(repo.rows[0].comments).toBeNull();
  });
});
