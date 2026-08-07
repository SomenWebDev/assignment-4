import type { Request, Response } from "express";
import httpStatus from "http-status";

import { createReview } from "./review.service";
import { createReviewSchema } from "./review.validation";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendRsponse";
// fixed typo

export const addReview = catchAsync(async (req: Request, res: Response) => {
  const input = createReviewSchema.parse(req.body);
  const review = await createReview(req.user!.id, input);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review submitted successfully",
    data: review,
  });
});
