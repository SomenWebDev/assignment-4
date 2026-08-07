import { Router, type IRouter } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";
import { addReview } from "./review.controller";

const reviewRouter: IRouter = Router();

reviewRouter.post("/", auth(Role.CUSTOMER), addReview);

export default reviewRouter;
