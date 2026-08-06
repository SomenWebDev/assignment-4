import type { Request, Response } from "express";
import httpStatus from "http-status";

import {
  gearIdParamSchema,
  createGearSchema,
  updateGearSchema,
  gearFilterSchema,
} from "./gear.validation";
import {
  createGear as createGearService,
  getGearById,
  getAllGear,
  getMyGear,
  updateGear,
  deleteGear,
} from "./gear.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendRsponse";

export const getGears = catchAsync(async (req: Request, res: Response) => {
  const filters = gearFilterSchema.parse(req.query);
  const { data, meta } = await getAllGear(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear items retrieved successfully",
    data,
    meta,
  });
});

export const getGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = gearIdParamSchema.parse(req.params);
  const gear = await getGearById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item retrieved successfully",
    data: gear,
  });
});

export const getMyGears = catchAsync(async (req: Request, res: Response) => {
  const gears = await getMyGear(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your gear items retrieved successfully",
    data: gears,
  });
});

export const addGear = catchAsync(async (req: Request, res: Response) => {
  const input = createGearSchema.parse(req.body);
  const gear = await createGearService(req.user!.id, input);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear item created successfully",
    data: gear,
  });
});

export const editGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = gearIdParamSchema.parse(req.params);
  const input = updateGearSchema.parse(req.body);
  const gear = await updateGear(req.user!, id, input);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item updated successfully",
    data: gear,
  });
});

export const removeGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = gearIdParamSchema.parse(req.params);
  await deleteGear(req.user!, id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item deleted successfully",
    data: null,
  });
});
