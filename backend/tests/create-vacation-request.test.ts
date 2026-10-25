import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { repo, resetWorld, recordEvents } from "./helpers/setup";

vi.mock("../src/shared/db/data-source", () => ({
  getDataSource: async () => ({ getRepository: () => repo }),
}));

import { handleCreateVacationRequest } from "../src/modules/vacation-requests/create-vacation-request.command-handler";
import { CreateVacationRequestCommand } from "../src/modules/vacation-requests/vacation-request.commands";
import { VacationRequestCreatedEvent } from "../src/modules/vacation-requests/vacation-request.events";
import { BadRequestError, ConflictError } from "../src/shared/errors";

// "Today" is fixed, so the tests do not depend on the real date.
const TODAY = "2026-11-10";
const create = (start: string, end: string, userId = 1) =>
  handleCreateVacationRequest(new CreateVacationRequestCommand(userId, start, end, null));

let events: object[];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 10, 12, 0, 0)); // 10 Nov 2026, local time
  resetWorld();
  events = recordEvents();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("CreateVacationRequest: input rules", () => {
  it("rejects an end date before the start date (400) and publishes nothing", async () => {
    await expect(create("2026-12-05", "2026-12-01")).rejects.toBeInstanceOf(BadRequestError);
    expect(repo.rows).toHaveLength(0);
    expect(events).toHaveLength(0);
  });

  it("rejects a start date in the past (400)", async () => {
    await expect(create("2026-11-09", "2026-11-12")).rejects.toBeInstanceOf(BadRequestError);
    expect(repo.rows).toHaveLength(0);
  });

  it("accepts a request that starts today", async () => {
    const saved = await create(TODAY, TODAY);
    expect(saved.status).toBe("Pending");
  });

  it("accepts a one-day vacation (start equals end)", async () => {
    await expect(create("2026-12-01", "2026-12-01")).resolves.toMatchObject({ startDate: "2026-12-01" });
  });
});

describe("CreateVacationRequest: overlap rule", () => {
  beforeEach(() => {
    repo.seed({ userId: 1, startDate: "2026-12-10", endDate: "2026-12-15", status: "Pending" });
  });

  it.each([
    ["starts inside the existing one", "2026-12-12", "2026-12-20"],
    ["ends inside the existing one", "2026-12-05", "2026-12-11"],
    ["is inside the existing one", "2026-12-11", "2026-12-13"],
    ["covers the existing one", "2026-12-01", "2026-12-30"],
    ["touches the last day", "2026-12-15", "2026-12-18"],
    ["touches the first day", "2026-12-08", "2026-12-10"],
  ])("conflicts (409) when the new request %s", async (_name, start, end) => {
    await expect(create(start, end)).rejects.toBeInstanceOf(ConflictError);
    expect(repo.rows).toHaveLength(1);
    expect(events).toHaveLength(0);
  });

  it.each([
    ["the day before", "2026-12-05", "2026-12-09"],
    ["the day after", "2026-12-16", "2026-12-20"],
  ])("allows a request %s", async (_name, start, end) => {
    await expect(create(start, end)).resolves.toBeDefined();
    expect(repo.rows).toHaveLength(2);
  });

  it("also conflicts with an Approved request", async () => {
    repo.rows[0].status = "Approved";
    await expect(create("2026-12-12", "2026-12-13")).rejects.toBeInstanceOf(ConflictError);
  });

  it("ignores a Rejected request: the dates are free again", async () => {
    repo.rows[0].status = "Rejected";
    await expect(create("2026-12-12", "2026-12-13")).resolves.toBeDefined();
  });

  it("ignores other users' requests", async () => {
    await expect(create("2026-12-12", "2026-12-13", 2)).resolves.toBeDefined();
  });
});

describe("CreateVacationRequest: success", () => {
  it("saves a Pending request and publishes VacationRequestCreatedEvent once", async () => {
    const saved = await create("2026-12-01", "2026-12-05");

    expect(saved).toMatchObject({ userId: 1, startDate: "2026-12-01", endDate: "2026-12-05", status: "Pending" });
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(VacationRequestCreatedEvent);
    expect(events[0]).toMatchObject({ requestId: saved.id, userId: 1, startDate: "2026-12-01", endDate: "2026-12-05" });
  });
});
