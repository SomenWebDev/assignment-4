import { Router, type IRouter } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";
import {
  createPayment,
  getMyPayments,
  getPaymentDetails,
} from "./payment.controller";

const paymentRouter: IRouter = Router();

paymentRouter.post("/create", auth(Role.CUSTOMER), createPayment);
paymentRouter.get("/", auth(Role.CUSTOMER, Role.ADMIN), getMyPayments);
paymentRouter.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), getPaymentDetails);

export default paymentRouter;
