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

// The database id column is a 32-bit integer. A bigger number would make PostgreSQL fail
// (a 500), so ids from the URL or the query string are limited to this value (a 400 instead).
export const MAX_ID = 2147483647;

// Shared by every list endpoint: ?page=1&limit=10 (limit at most 50). Bad values -> 400.
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
