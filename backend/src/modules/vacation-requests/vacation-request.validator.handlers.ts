import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { HandlerFn, InputParserFn } from "../../shared/types";
import { BadRequestError } from "../../shared/errors";
import { parseJsonBody, parsePaging, parsePositiveInt } from "../../shared/http";
import { authenticate } from "../../shared/auth";
import { commandBus } from "../../shared/bus";
import {
  ApproveVacationRequestCommand,
  RejectVacationRequestCommand,
} from "./vacation-request.commands";
import { listAllRequests, RequestFilters } from "./vacation-request.queries";
import { RequestStatus, VacationRequest } from "./vacation-request.entity";

// API handlers for the Validator. Thin, like the Requester ones: check the token and the
// input shape, build a command, dispatch it. Only Validators get past the parser (else 403).

const STATUSES: RequestStatus[] = ["Pending", "Approved", "Rejected"];

function parseRequestId(event: CommonEvent): number {
  const id = parsePositiveInt(event.pathParameters?.id, 0, "id");
  if (!id) throw new BadRequestError("id must be a whole number from 1");
  return id;
}

// --- GET /vacation-requests?status=&userId=&page=&limit= ---

interface ListAllInput {
  filters: RequestFilters;
  page: number;
  limit: number;
}

export const parseListAll: InputParserFn = (event: CommonEvent): ListAllInput => {
  authenticate(event, ["Validator"]);
  const query = event.queryStringParameters ?? {};
  const filters: RequestFilters = {};
  if (query.status) {
    if (!STATUSES.includes(query.status as RequestStatus)) {
      throw new BadRequestError(`status must be one of ${STATUSES.join(", ")}`);
    }
    filters.status = query.status as RequestStatus;
  }
  if (query.userId) {
    filters.userId = parsePositiveInt(query.userId, 0, "userId");
  }
  return { filters, ...parsePaging(event) };
};

export const listAll: HandlerFn = async (input: ListAllInput) =>
  listAllRequests(input.filters, input.page, input.limit);

// --- PATCH /vacation-requests/:id/approve ---

export const parseApprove: InputParserFn = (event: CommonEvent) => {
  authenticate(event, ["Validator"]);
  return { requestId: parseRequestId(event) };
};

export const approve: HandlerFn = async (input: { requestId: number }) =>
  commandBus.dispatch<VacationRequest>(new ApproveVacationRequestCommand(input.requestId));

// --- PATCH /vacation-requests/:id/reject  body: { comment } ---

export const parseReject: InputParserFn = (event: CommonEvent) => {
  authenticate(event, ["Validator"]);
  const requestId = parseRequestId(event);
  const { comment } = parseJsonBody(event);
  // Only the shape is checked here. "Comment must not be empty" is a business rule,
  // so it lives in the command handler.
  if (comment !== undefined && typeof comment !== "string") {
    throw new BadRequestError("comment must be text");
  }
  return { requestId, comment: comment ?? "" };
};

export const reject: HandlerFn = async (input: { requestId: number; comment: string }) =>
  commandBus.dispatch<VacationRequest>(new RejectVacationRequestCommand(input.requestId, input.comment));
