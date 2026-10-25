import { HandlerFn, InputParserFn } from "../../shared/types";
import { parsePaging } from "../../shared/http";
import { authenticate } from "../../shared/auth";
import { listTeamVacations } from "../vacation-requests/vacation-request.queries";

// --- GET /team/vacations (any logged-in user: Requester or Validator) ---
// Read only, so like "list mine" it is a plain query: no command, no event.

export const parseTeamVacations: InputParserFn = (event) => {
  authenticate(event); // no role list: both roles may look
  return parsePaging(event);
};

export const teamVacations: HandlerFn = async (input: { page: number; limit: number }) =>
  listTeamVacations(input.page, input.limit);
