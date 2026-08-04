import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import type { Role } from "../../prisma/generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/app-errorr";
import { verifyAccessToken } from "../utils/jwt";

const auth = (...roles: Role[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized - No token provided",
      );
    }

    const token = authHeader.slice(7);

    try {
      const decoded = verifyAccessToken(token);

      if (roles.length && !roles.includes(decoded.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Forbidden - Unauthorized access",
        );
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized - Invalid token",
      );
    }
  });

export default auth;
