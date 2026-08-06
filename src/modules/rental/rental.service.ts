import httpStatus from "http-status";
import prisma from "../../lib/prisma";

import type { UserJwtPayload } from "../../utils/jwt";
import { RentalStatus } from "../../../prisma/generated/prisma/enums";
import type {
  CreateRentalInput,
  UpdateRentalStatusInput,
} from "./rental.validation";
import { AppError } from "../../utils/app-errorr";

const ACTIVE_STATUSES: RentalStatus[] = [
  RentalStatus.PLACED,
  RentalStatus.CONFIRMED,
  RentalStatus.PAID,
  RentalStatus.PICKED_UP,
];

export async function createRental(
  customerId: string,
  input: CreateRentalInput,
) {
  const { startDate, endDate, items } = input;

  return prisma.$transaction(async (tx) => {
    const rentalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    let totalAmount = 0;
    const orderItemsData: {
      gearItemId: string;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of items) {
      const gear = await tx.gearItem.findUnique({
        where: { id: item.gearItemId },
      });

      if (!gear || !gear.isAvailable) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Gear item ${item.gearItemId} is not available`,
        );
      }

      // Problem 1 fix: customer can't rent their own listed gear
      if (gear.providerId === customerId) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "You cannot rent your own gear",
        );
      }

      const overlapping = await tx.rentalOrderItem.findMany({
        where: {
          gearItemId: item.gearItemId,
          rentalOrder: {
            status: { in: ACTIVE_STATUSES },
            startDate: { lt: endDate },
            endDate: { gt: startDate },
          },
        },
        select: { quantity: true },
      });

      const alreadyBooked = overlapping.reduce((sum, o) => sum + o.quantity, 0);
      const availableStock = gear.stock - alreadyBooked;

      if (item.quantity > availableStock) {
        throw new AppError(
          httpStatus.CONFLICT,
          `Only ${availableStock} unit(s) of "${gear.name}" available for the selected dates`,
        );
      }

      const price = Number(gear.pricePerDay) * item.quantity * rentalDays;
      totalAmount += price;

      orderItemsData.push({
        gearItemId: item.gearItemId,
        quantity: item.quantity,
        price,
      });
    }

    return tx.rentalOrder.create({
      data: {
        customerId,
        startDate,
        endDate,
        totalAmount,
        items: { create: orderItemsData },
      },
      include: { items: { include: { gearItem: true } } },
    });
  });
}

// Problem 4 fix: getRentalById now takes the requesting user and enforces ownership
export async function getRentalById(user: UserJwtPayload, id: string) {
  const order = await prisma.rentalOrder.findUnique({
    where: { id },
    include: { items: { include: { gearItem: true } }, payments: true },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  const isOwner = order.customerId === user.id;
  const isProviderOnOrder = order.items.some(
    (item) => item.gearItem.providerId === user.id,
  );

  if (user.role !== "ADMIN" && !isOwner && !isProviderOnOrder) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this order",
    );
  }

  return order;
}

export async function getMyOrders(customerId: string) {
  return prisma.rentalOrder.findMany({
    where: { customerId },
    include: { items: { include: { gearItem: true } }, payments: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getIncomingOrders(providerId: string) {
  return prisma.rentalOrder.findMany({
    where: { items: { some: { gearItem: { providerId } } } },
    include: {
      items: { include: { gearItem: true } },
      customer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function cancelRental(user: UserJwtPayload, id: string) {
  const order = await getRentalById(user, id); // updated call: now passes user

  if (user.role !== "ADMIN" && order.customerId !== user.id) {
    throw new AppError(httpStatus.FORBIDDEN, "This is not your order");
  }
  if (order.status !== RentalStatus.PLACED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel an order that is already ${order.status}`,
    );
  }

  return prisma.rentalOrder.update({
    where: { id },
    data: { status: RentalStatus.CANCELLED },
  });
}

const VALID_TRANSITIONS: Record<RentalStatus, RentalStatus[]> = {
  PLACED: [RentalStatus.CONFIRMED, RentalStatus.CANCELLED],
  CONFIRMED: [RentalStatus.CANCELLED],
  PAID: [RentalStatus.PICKED_UP],
  PICKED_UP: [RentalStatus.RETURNED],
  RETURNED: [],
  CANCELLED: [],
};

export async function updateRentalStatus(
  user: UserJwtPayload,
  id: string,
  input: UpdateRentalStatusInput,
) {
  const order = await prisma.rentalOrder.findUnique({
    where: { id },
    include: { items: { include: { gearItem: true } } },
  });
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  const ownsOrder = order.items.some(
    (item) => item.gearItem.providerId === user.id,
  );
  if (user.role !== "ADMIN" && !ownsOrder) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not provide any gear in this order",
    );
  }

  const allowedNext = VALID_TRANSITIONS[order.status];
  if (!allowedNext.includes(input.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot move order from ${order.status} to ${input.status}`,
    );
  }

  return prisma.rentalOrder.update({
    where: { id },
    data: { status: input.status },
  });
}
