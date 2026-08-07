import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import { RentalStatus } from "../../../prisma/generated/prisma/enums";
import type { CreateReviewInput } from "./review.validation";
import { AppError } from "../../utils/app-errorr";

export async function createReview(
  customerId: string,
  input: CreateReviewInput,
) {
  const { gearItemId, rating, comment } = input;

  const gear = await prisma.gearItem.findUnique({ where: { id: gearItemId } });
  if (!gear) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  const eligibleOrder = await prisma.rentalOrderItem.findFirst({
    where: {
      gearItemId,
      rentalOrder: {
        customerId,
        status: RentalStatus.RETURNED,
      },
    },
  });

  if (!eligibleOrder) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only review gear after completing a returned rental",
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: { customerId, gearItemId },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this gear item",
    );
  }

  return prisma.review.create({
    data: {
      customerId,
      gearItemId,
      rating,
      comment: comment ?? null,
    },
    include: {
      customer: { select: { id: true, name: true } },
    },
  });
}
