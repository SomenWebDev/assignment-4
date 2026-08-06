import type { Request, Response } from "express";
import httpStatus from "http-status";

import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from "./category.validation";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendRsponse";

export const getCategories = catchAsync(
  async (_req: Request, res: Response) => {
    const categories = await getAllCategories();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categories retrieved successfully",
      data: categories,
    });
  },
);

export const getCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = categoryIdParamSchema.parse(req.params);
  const category = await getCategoryById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category retrieved successfully",
    data: category,
  });
});

export const addCategory = catchAsync(async (req: Request, res: Response) => {
  const input = createCategorySchema.parse(req.body);
  const category = await createCategory(input);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: category,
  });
});

export const editCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = categoryIdParamSchema.parse(req.params);
  const input = updateCategorySchema.parse(req.body);
  const category = await updateCategory(id, input);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category updated successfully",
    data: category,
  });
});

export const removeCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = categoryIdParamSchema.parse(req.params);
    await deleteCategory(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category deleted successfully",
      data: null,
    });
  },
);
