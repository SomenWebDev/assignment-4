import httpStatus from "http-status";
import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";

import { getMe, loginUser, registerUser } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validation";
import { sendResponse } from "../utils/sendRsponse";

export const register = catchAsync(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);

  const result = await registerUser(input);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: { user: result },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);

  const result = await loginUser(input);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Login successful",
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  const result = await getMe(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User retrieved successfully",
    data: result,
  });
});
