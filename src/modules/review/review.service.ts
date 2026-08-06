// import httpStatus from "http-status";
// import prisma from "../../lib/prisma";

// import type { UserJwtPayload } from "../../utils/jwt";
// import { RentalStatus } from "../../../prisma/generated/prisma/enums";
// import type { CreateReviewInput } from "./review.validation";
// import { AppError } from "../../utils/app-errorr";

// export async function createReview(customerId: string, input: CreateReviewInput) {
//   const gear = await prisma.gearItem.findUnique({ where: { id: input.gearItemId } });
//   if (!gear) {
//     throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
//   }

//   // Verify the customer has actually rented and returned this exact gear item.
//   const hasReturnedRental = await prisma.rentalOrderItem.findFirst({
//     where: {
//       gearItemId: input.gearItemId,
//       rentalOrder: {
//         customerId,
//         status: RentalStatus.RETURNED,
//       },
//     },
//   });

//   if (!hasReturnedRental) {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       "You can only review gear you have rented and returned",
//     );
//   }

//   const existingReview = await prisma.review.findFirst({
//     where: { customerId, gearItemId: input.gearItemId },
//   });
//   if (existingReview) {
//     throw new AppError(httpStatus.CONFLICT, "You have already reviewed this gear item");
//   }

//   return prisma.review.create({
//     data: {
//       customerId,
//       gearItemId: input.gearItemId,
//       rating: input.rating,
//       comment: input.comment,
//     },
//   });
// }

// export async function getReviewsForGear(gearItemId: string) {
//   const gear = await prisma.gearItem.findUnique({ where: { id: gearItemId } });
//   if (!gear) {
//     throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
//   }

//   return prisma.review.findMany({
//     where: { gearItemId },
//     include: { customer: { select: { id: true, name: true } } },
//     orderBy: { createdAt: "desc" },
//   });
// }

// export async function deleteReview(user: UserJwtPayload, reviewId: string) {
//   const review = await prisma.review.findUnique({ where: { id: reviewId } });
//   if (!review) {
//     throw new AppError(httpStatus.NOT_FOUND, "Review not found");
//   }
//   if (user.role !== "ADMIN" && review.customerId !== user.id) {
//     throw new AppError(httpStatus.FORBIDDEN, "You cannot delete this review");
//   }

//   return prisma.review.delete({ where: { id: reviewId } });
// }
