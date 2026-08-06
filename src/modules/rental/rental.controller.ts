import type { Request, Response } from "express";
import httpStatus from "http-status";

import {
  createRentalSchema,
  updateRentalStatusSchema,
  rentalIdParamSchema,
} from "./rental.validation";
import {
  createRental,
  getRentalById,
  getMyOrders,
  getIncomingOrders,
  cancelRental,
  updateRentalStatus,
} from "./rental.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendRsponse";

export const addRental = catchAsync(async (req: Request, res: Response) => {
  const input = createRentalSchema.parse(req.body);
  const order = await createRental(req.user!.id, input);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental order placed successfully",
    data: order,
  });
});

export const getRental = catchAsync(async (req: Request, res: Response) => {
  const { id } = rentalIdParamSchema.parse(req.params);
  const order = await getRentalById(req.user!, id); // ownership check now enforced in service

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order retrieved successfully",
    data: order,
  });
});

export const getMyRentals = catchAsync(async (req: Request, res: Response) => {
  const orders = await getMyOrders(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your rental orders retrieved successfully",
    data: orders,
  });
});

export const getIncomingRentals = catchAsync(
  async (req: Request, res: Response) => {
    const orders = await getIncomingOrders(req.user!.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Incoming rental orders retrieved successfully",
      data: orders,
    });
  },
);

export const cancelMyRental = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = rentalIdParamSchema.parse(req.params);
    const order = await cancelRental(req.user!, id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental order cancelled successfully",
      data: order,
    });
  },
);

export const editRentalStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = rentalIdParamSchema.parse(req.params);
    const input = updateRentalStatusSchema.parse(req.body);
    const order = await updateRentalStatus(req.user!, id, input);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental order status updated successfully",
      data: order,
    });
  },
);
