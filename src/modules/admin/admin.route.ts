import { Router } from "express";
import {
  getUsers,
  getUser,
  editUserStatus,
  getRentals,
  getGearItems,
} from "./admin.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const adminRouter = Router();

adminRouter.get("/users", auth(Role.ADMIN), getUsers);
adminRouter.get("/users/:id", auth(Role.ADMIN), getUser);
adminRouter.patch("/users/:id/status", auth(Role.ADMIN), editUserStatus);
adminRouter.get("/rentals", auth(Role.ADMIN), getRentals);
adminRouter.get("/gear", auth(Role.ADMIN), getGearItems);

export default adminRouter;
