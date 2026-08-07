import type { Request, Response } from "express";
import httpStatus from "http-status";

import { userIdParamSchema, updateUserStatusSchema } from "./admin.validation";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllRentalOrders,
  getAllGearItems,
} from "./admin.service";
import { sendResponse } from "../../utils/sendRsponse";
import { catchAsync } from "../../utils/catchAsync";

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await getAllUsers();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: users,
  });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = userIdParamSchema.parse(req.params);
  const user = await getUserById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User retrieved successfully",
    data: user,
  });
});

export const editUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = userIdParamSchema.parse(req.params);
    const input = updateUserStatusSchema.parse(req.body);
    const user = await updateUserStatus(req.user!.id, id, input);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully",
      data: user,
    });
  },
);

export const getRentals = catchAsync(async (req: Request, res: Response) => {
  const orders = await getAllRentalOrders();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All rental orders retrieved successfully",
    data: orders,
  });
});

export const getGearItems = catchAsync(async (req: Request, res: Response) => {
  const gear = await getAllGearItems();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All gear items retrieved successfully",
    data: gear,
  });
});
