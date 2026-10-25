import bcrypt from "bcryptjs";
import { InputParserFn, HandlerFn } from "../../shared/types";
import { UnauthorizedError, BadRequestError } from "../../shared/errors";
import { parseJsonBody } from "../../shared/http";
import { authenticate, signToken, AuthUser } from "../../shared/auth";
import { getDataSource } from "../../shared/db/data-source";
import { User } from "../users/user.entity";

// --- POST /auth/login ---

interface LoginInput {
  email: string;
  password: string;
}

export const parseLogin: InputParserFn = (event): LoginInput => {
  const body = parseJsonBody(event);
  const { email, password } = body;
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    throw new BadRequestError("email and password are required");
  }
  return { email: email.trim().toLowerCase(), password };
};

export const login: HandlerFn = async (input: LoginInput) => {
  const ds = await getDataSource();
  // The password column is select:false, so we ask for it explicitly here.
  const user = await ds
    .getRepository(User)
    .createQueryBuilder("user")
    .addSelect("user.password")
    .where("user.email = :email", { email: input.email })
    .getOne();

  const passwordOk = user ? await bcrypt.compare(input.password, user.password) : false;
  if (!user || !passwordOk) {
    // Same message for an unknown email and a wrong password, so nobody can probe which emails exist.
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = signToken({ id: user.id, name: user.name, role: user.role });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

// --- GET /auth/me (any logged-in user) ---

export const parseMe: InputParserFn = (event) => ({ user: authenticate(event) });

export const getMe: HandlerFn = async (input: { user: AuthUser }) => ({ user: input.user });
