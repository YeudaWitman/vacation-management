import { HandlerFn, InputParserFn } from "../../shared/types";
import { authenticate } from "../../shared/auth";
import { listRequesters } from "./user.queries";

// --- GET /users (Validator only) ---
// Feeds the requester dropdown on the Validator dashboard.
// Which fields leave the server is decided in the query (id and name only).

export const parseListUsers: InputParserFn = (event) => {
  authenticate(event, ["Validator"]); // a Requester gets 403, no token gets 401
  return {};
};

export const listUsers: HandlerFn = async () => ({ items: await listRequesters() });
