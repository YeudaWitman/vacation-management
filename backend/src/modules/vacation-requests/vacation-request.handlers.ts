import { Response } from "commoneventframework";
import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { HandlerFn, InputParserFn } from "../../shared/types";
import { BadRequestError } from "../../shared/errors";
import { parseJsonBody } from "../../shared/http";
import { authenticate, AuthUser } from "../../shared/auth";
import { isValidIsoDate } from "../../shared/dates";
import { commandBus } from "../../shared/bus";
import { CreateVacationRequestCommand } from "./vacation-request.commands";
import { listRequestsOfUser } from "./vacation-request.queries";
import { VacationRequest } from "./vacation-request.entity";

// These are API handlers: thin. The parser checks the token and the shape of the input,
// the handler builds a command and dispatches it. The rules live in the command handler.

// --- POST /vacation-requests (Requester) ---

interface CreateInput {
  user: AuthUser;
  startDate: string;
  endDate: string;
  reason: string | null;
}

export const parseCreate: InputParserFn = (event): CreateInput => {
  const user = authenticate(event, ["Requester"]);
  const { startDate, endDate, reason } = parseJsonBody(event);
  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
    throw new BadRequestError("startDate and endDate are required, as YYYY-MM-DD");
  }
  if (reason !== undefined && reason !== null && typeof reason !== "string") {
    throw new BadRequestError("reason must be text");
  }
  return { user, startDate, endDate, reason: reason ? reason.trim() || null : null };
};

export const createRequest: HandlerFn = async (input: CreateInput) => {
  const created = await commandBus.dispatch<VacationRequest>(
    new CreateVacationRequestCommand(input.user.id, input.startDate, input.endDate, input.reason)
  );
  return new Response(201, created);
};

// --- GET /vacation-requests/mine (Requester, paginated) ---

interface ListMineInput {
  user: AuthUser;
  page: number;
  limit: number;
}

export function parsePositiveInt(raw: string | undefined, fallback: number, name: string, max?: number): number {
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || (max !== undefined && value > max)) {
    throw new BadRequestError(`${name} must be a whole number from 1${max ? ` to ${max}` : ""}`);
  }
  return value;
}

export function parsePaging(event: CommonEvent): { page: number; limit: number } {
  const query = event.queryStringParameters ?? {};
  return {
    page: parsePositiveInt(query.page, 1, "page"),
    limit: parsePositiveInt(query.limit, 10, "limit", 50),
  };
}

export const parseListMine: InputParserFn = (event): ListMineInput => ({
  user: authenticate(event, ["Requester"]),
  ...parsePaging(event),
});

export const listMine: HandlerFn = async (input: ListMineInput) =>
  listRequestsOfUser(input.user.id, input.page, input.limit);
