import jwt from "jsonwebtoken";
import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import type { UserRole } from "../modules/users/user.entity";
import { ForbiddenError, UnauthorizedError } from "./errors";
import { getHeader } from "./http";

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function signToken(user: AuthUser): string {
  // The token carries the user id (as "sub"), name and role. It is signed, not encrypted.
  return jwt.sign({ name: user.name, role: user.role }, getSecret(), {
    subject: String(user.id),
    expiresIn: "8h",
  });
}

// Used by every protected route's input parser.
// No token or a bad token -> 401. Valid token but a role that is not allowed -> 403.
export function authenticate(event: CommonEvent, allowedRoles?: UserRole[]): AuthUser {
  const header = getHeader(event, "authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or malformed Authorization header");
  }

  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(header.slice("Bearer ".length), getSecret());
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
  if (typeof payload === "string" || !payload.sub) {
    throw new UnauthorizedError("Invalid token");
  }

  const user: AuthUser = {
    id: Number(payload.sub),
    name: String(payload.name),
    role: payload.role as UserRole,
  };

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new ForbiddenError("You do not have permission to do this");
  }
  return user;
}
