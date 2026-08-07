import type { Request, Response } from "express";
import { z } from "zod";
import httpStatus from "http-status";
import stripe from "../../lib/stripe";
import config from "../../config";

import {
  createCheckoutSession,
  completePayment,
  failPayment,
} from "./payment.service";
import prisma from "../../lib/prisma";
import { Role } from "../../../prisma/generated/prisma/enums";
import { sendResponse } from "../../utils/sendRsponse";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/app-errorr";

const createPaymentSchema = z.object({
  rentalOrderId: z.uuid("Invalid rental order id"),
});

const paymentIdParamSchema = z.object({
  id: z.uuid("Invalid payment id"),
});

export const createPayment = catchAsync(async (req: Request, res: Response) => {
  const { rentalOrderId } = createPaymentSchema.parse(req.body);

  const result = await createCheckoutSession(req.user!.id, rentalOrderId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment session created",
    data: result,
  });
});

export const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing stripe-signature header",
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw Buffer — see app.ts, must be mounted before express.json()
      signature,
      config.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid webhook signature");
  }

  const session = event.data.object as {
    id: string;
    metadata?: { rentalOrderId?: string };
  };
  const rentalOrderId = session.metadata?.rentalOrderId;

  if (rentalOrderId) {
    if (event.type === "checkout.session.completed") {
      await completePayment(rentalOrderId, session.id);
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      await failPayment(rentalOrderId);
    }
  }

  res.json({ received: true });
});

export const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const where =
    req.user!.role === Role.ADMIN
      ? {}
      : { rentalOrder: { customerId: req.user!.id } };

  const payments = await prisma.payment.findMany({
    where,
    include: {
      rentalOrder: { include: { items: { include: { gearItem: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments retrieved successfully",
    data: payments,
  });
});

export const getPaymentDetails = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = paymentIdParamSchema.parse(req.params);

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        rentalOrder: { include: { items: { include: { gearItem: true } } } },
      },
    });

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    if (
      req.user!.role !== Role.ADMIN &&
      payment.rentalOrder.customerId !== req.user!.id
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Forbidden - This is not your payment",
      );
    }

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment retrieved successfully",
      data: payment,
    });
  },
);
