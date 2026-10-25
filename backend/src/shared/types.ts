import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { APIGatewayProxyStructuredResultV2 } from "commoneventframework";

// An input parser runs first: it checks the token and the body, and returns clean input.
// It must be synchronous. If it throws an HttpError, the request stops with that status.
export type InputParserFn = (event: CommonEvent) => any;

// A handler runs after the parser. It does the work and returns the response body.
export type HandlerFn = (input: any, event: CommonEvent) => Promise<APIGatewayProxyStructuredResultV2 | object>;
