import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { BadRequestError } from "./errors";

// Header names can arrive in any case depending on the source, so compare in lower case.
export function getHeader(event: CommonEvent, name: string): string | undefined {
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(event.headers ?? {})) {
    if (key.toLowerCase() === wanted) return value;
  }
  return undefined;
}

export function parseJsonBody(event: CommonEvent): Record<string, unknown> {
  if (!event.body) {
    throw new BadRequestError("Request body is required");
  }
  try {
    const parsed = JSON.parse(event.body);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("not an object");
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new BadRequestError("Request body must be a valid JSON object");
  }
}
