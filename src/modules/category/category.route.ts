import { Router } from "express";
import {
  getCategories,
  getCategory,
  addCategory,
  editCategory,
  removeCategory,
} from "./category.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const categoryRouter = Router();

// Public
categoryRouter.get("/", getCategories);
categoryRouter.get("/:id", getCategory);

// Admin only
categoryRouter.post("/", auth(Role.ADMIN), addCategory);
categoryRouter.put("/:id", auth(Role.ADMIN), editCategory);
categoryRouter.delete("/:id", auth(Role.ADMIN), removeCategory);

export default categoryRouter;
