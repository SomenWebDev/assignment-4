import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import stripe from "../../lib/stripe";
import config from "../../config";

import {
  PaymentMethod,
  PaymentStatus,
  RentalStatus,
} from "../../../prisma/generated/prisma/enums";
import { AppError } from "../../utils/app-errorr";

const CURRENCY = "usd";

export async function createCheckoutSession(
  customerId: string,
  rentalOrderId: string,
) {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: { payment: true },
  });

  if (!rentalOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  if (rentalOrder.customerId !== customerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Forbidden - This is not your rental order",
    );
  }

  if (rentalOrder.status !== RentalStatus.CONFIRMED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot pay for a ${rentalOrder.status} rental order`,
    );
  }

  if (rentalOrder.payment?.status === PaymentStatus.COMPLETED) {
    throw new AppError(httpStatus.CONFLICT, "Rental order is already paid");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    metadata: { rentalOrderId: rentalOrder.id },
    success_url: `${config.CLIENT_URL}/payment/success`,
    cancel_url: `${config.CLIENT_URL}/payment/cancel`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: Math.round(Number(rentalOrder.totalAmount) * 100),
          product_data: {
            name: `Rental Order #${rentalOrder.id}`,
          },
        },
      },
    ],
  });

  await prisma.payment.upsert({
    where: { rentalOrderId: rentalOrder.id },
    create: {
      rentalOrderId: rentalOrder.id,
      amount: rentalOrder.totalAmount,
      method: PaymentMethod.STRIPE,
      transactionId: session.id,
    },
    update: {
      transactionId: session.id,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.STRIPE,
    },
  });

  return { checkoutUrl: session.url, sessionId: session.id };
}

export async function completePayment(
  rentalOrderId: string,
  transactionId: string,
) {
  const payment = await prisma.payment.findUnique({ where: { rentalOrderId } });

  if (!payment || payment.status === PaymentStatus.COMPLETED) return;

  await prisma.$transaction([
    prisma.payment.update({
      where: { rentalOrderId },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId,
        paidAt: new Date(),
      },
    }),
    prisma.rentalOrder.update({
      where: { id: rentalOrderId },
      data: { status: RentalStatus.PAID },
    }),
  ]);
}

export async function failPayment(rentalOrderId: string) {
  await prisma.payment.updateMany({
    where: { rentalOrderId, status: PaymentStatus.PENDING },
    data: { status: PaymentStatus.FAILED },
  });
}
