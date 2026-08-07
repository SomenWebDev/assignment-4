import httpStatus from "http-status";
import prisma from "../../lib/prisma";

import { Role } from "../../../prisma/generated/prisma/enums";
import type { UpdateUserStatusInput } from "./admin.validation";
import { AppError } from "../../utils/app-errorr";

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
}

export async function updateUserStatus(
  adminId: string,
  id: string,
  input: UpdateUserStatusInput,
) {
  const user = await getUserById(id);

  if (user.role === Role.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Cannot change the status of an admin account",
    );
  }
  if (user.id === adminId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot change your own status",
    );
  }

  return prisma.user.update({
    where: { id },
    data: { status: input.status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });
}

export async function getAllRentalOrders() {
  return prisma.rentalOrder.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      items: { include: { gearItem: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
