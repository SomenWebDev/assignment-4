import { Router } from "express";
import {
  addRental,
  getRental,
  getMyRentals,
  getIncomingRentals,
  cancelMyRental,
  editRentalStatus,
} from "./rental.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const rentalRouter = Router();

rentalRouter.post("/", auth(Role.CUSTOMER), addRental);
rentalRouter.get("/my-orders", auth(Role.CUSTOMER), getMyRentals);
rentalRouter.get("/provider/incoming", auth(Role.PROVIDER), getIncomingRentals);
rentalRouter.patch("/:id/cancel", auth(Role.CUSTOMER), cancelMyRental);
rentalRouter.patch(
  "/:id/status",
  auth(Role.PROVIDER, Role.ADMIN),
  editRentalStatus,
);
rentalRouter.get(
  "/:id",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  getRental,
);

export default rentalRouter;
