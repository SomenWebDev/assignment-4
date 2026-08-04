import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";

import { Prisma } from "../../prisma/generated/prisma/client";
import config from "../config";
import { AppError } from "../utils/app-errorr";
const { JsonWebTokenError, TokenExpiredError } = jwt;

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let errorDetails: unknown = err.message;

  // ── Zod validation errors ──
  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation error";
    errorDetails = err.issues.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
  }

  // ── Custom application errors ──
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails ?? err.message;
  }

  // ── JWT errors ──
  else if (err instanceof TokenExpiredError) {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Token expired";
    errorDetails = "Your session has expired. Please log in again.";
  } else if (err instanceof JsonWebTokenError) {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid token";
    errorDetails = err.message;
  }

  // ── Prisma known request errors (unique constraint, FK violation, not found) ──
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const target = (err.meta?.target as string[])?.join(", ") ?? "field";
        statusCode = httpStatus.CONFLICT;
        message = "Duplicate entry";
        errorDetails = `A record with this ${target} already exists`;
        break;
      }
      case "P2003": {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Invalid reference";
        errorDetails = `Foreign key constraint failed on field: ${err.meta?.field_name ?? "unknown"}`;
        break;
      }
      case "P2025": {
        statusCode = httpStatus.NOT_FOUND;
        message = "Record not found";
        errorDetails = err.meta?.cause ?? "The requested record does not exist";
        break;
      }
      default: {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Database request error";
        errorDetails = err.message;
      }
    }
  }

  // ── Prisma validation errors (e.g. wrong data type passed to a field) ──
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid data provided";
    errorDetails =
      "Please check the request payload matches the expected schema";
  }

  // ── Fallback: generic JS Error ──
  else if (err instanceof Error) {
    message = err.message;
    errorDetails = err.message;
  }

  // Log full error server-side (always, regardless of env)
  console.error(`[Error] ${req.method} ${req.originalUrl} →`, err);

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
    // Optional: include stack trace only in development
    ...(config.NODE_ENV === "development" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
};
