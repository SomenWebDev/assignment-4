import httpStatus from "http-status";

import type { UserJwtPayload } from "../../utils/jwt";
import type {
  CreateGearInput,
  UpdateGearInput,
  GearFilterInput,
} from "./gear.validation";
import { AppError } from "../../utils/app-errorr";
import prisma from "../../lib/prisma";
import type { Prisma } from "../../../prisma/generated/prisma/client";

export async function getGearById(id: string) {
  const gear = await prisma.gearItem.findUnique({
    where: { id },
    include: { category: true, provider: { select: { id: true, name: true } } },
  });
  if (!gear) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }
  return gear;
}

async function assertCanMutateGear(user: UserJwtPayload, gearId: string) {
  const gear = await getGearById(gearId);
  if (user.role !== "ADMIN" && gear.providerId !== user.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Forbidden - You do not own this gear item",
    );
  }
  return gear;
}

export async function createGear(providerId: string, input: CreateGearInput) {
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });

  if (!category) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category does not exist");
  }

  const data: Prisma.GearItemUncheckedCreateInput = {
    providerId,
    categoryId: input.categoryId,
    name: input.name,
    description: input.description ?? null,
    brand: input.brand ?? null,
    pricePerDay: input.pricePerDay,
    stock: input.stock,
  };

  return prisma.gearItem.create({ data });
}

export async function getAllGear(filters: GearFilterInput) {
  const { page, limit, categoryId, brand, minPrice, maxPrice, search } =
    filters;

  const where: Prisma.GearItemWhereInput = {
    isAvailable: true,
    ...(categoryId && { categoryId }),
    ...(brand && { brand: { contains: brand, mode: "insensitive" } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      pricePerDay: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.gearItem.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getMyGear(providerId: string) {
  return prisma.gearItem.findMany({
    where: { providerId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateGear(
  user: UserJwtPayload,
  id: string,
  input: UpdateGearInput,
) {
  await assertCanMutateGear(user, id);

  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new AppError(httpStatus.BAD_REQUEST, "Category does not exist");
    }
  }

  return prisma.gearItem.update({
    where: { id },
    data: input as Prisma.GearItemUpdateInput,
  });
}

export async function deleteGear(user: UserJwtPayload, id: string) {
  await assertCanMutateGear(user, id);

  const activeRental = await prisma.rentalOrderItem.findFirst({
    where: {
      gearItemId: id,
      rentalOrder: {
        status: { in: ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"] },
      },
    },
  });

  if (activeRental) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete gear with active rental orders",
    );
  }

  return prisma.gearItem.delete({ where: { id } });
}
