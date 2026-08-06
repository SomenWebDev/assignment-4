import httpStatus from "http-status";
import type { Prisma } from "../../../prisma/generated/prisma/client";
import prisma from "../../lib/prisma";

import { stripUndefined } from "../../utils/strip-undefined";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.validation";
import { AppError } from "../../utils/app-errorr";

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  const existing = await prisma.category.findUnique({
    where: { name: input.name },
  });
  if (existing) {
    throw new AppError(httpStatus.CONFLICT, "Category already exists");
  }
  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  await getCategoryById(id); // throws 404 if missing

  if (input.name !== undefined) {
    const existing = await prisma.category.findUnique({
      where: { name: input.name },
    });
    if (existing && existing.id !== id) {
      throw new AppError(httpStatus.CONFLICT, "Category name already in use");
    }
  }

  const data = stripUndefined(input) as Prisma.CategoryUpdateInput;

  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  await getCategoryById(id); // throws 404 if missing

  // onDelete: Restrict on GearItem.category → throws P2003 if any gear
  // still references this category. Caught and formatted by globalErrorHandler.
  return prisma.category.delete({ where: { id } });
}
