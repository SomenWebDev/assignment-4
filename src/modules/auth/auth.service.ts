import httpStatus from "http-status";
import bcrypt from "bcryptjs";

import type { RegisterInput, LoginInput } from "./auth.validation";
import {
  signAccessToken,
  signRefreshToken,
  type UserJwtPayload,
} from "../../utils/jwt";
import prisma from "../../lib/prisma";
import { AppError } from "../../utils/app-errorr";
import { UserStatus } from "../../../prisma/generated/prisma/enums";

function toJwtPayload(user: {
  id: string;
  email: string;
  role: UserJwtPayload["role"];
}): UserJwtPayload {
  return { id: user.id, email: user.email, role: user.role };
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
    },
    omit: { password: true },
  });

  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError(httpStatus.FORBIDDEN, "This account is suspended");
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  const payload = toJwtPayload(user);

  return {
    user: safeUser,
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
}
