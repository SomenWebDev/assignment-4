import { Router } from "express";
import {
  getGears,
  getGear,
  getMyGears,
  addGear,
  editGear,
  removeGear,
} from "./gear.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const gearRouter = Router();

// Public
gearRouter.get("/", getGears);
gearRouter.get("/provider/my-gear", auth(Role.PROVIDER), getMyGears);
gearRouter.get("/:id", getGear);

// Provider or Admin
gearRouter.post("/", auth(Role.PROVIDER), addGear);
gearRouter.put("/:id", auth(Role.PROVIDER, Role.ADMIN), editGear);
gearRouter.delete("/:id", auth(Role.PROVIDER, Role.ADMIN), removeGear);

export default gearRouter;
