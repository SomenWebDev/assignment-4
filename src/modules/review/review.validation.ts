import { z } from "zod";

export const createReviewSchema = z.object({
  gearItemId: z.uuid("Invalid gear item id"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z
    .string()
    .trim()
    .max(500, "Comment must not exceed 500 characters")
    .optional(),
});

export const reviewIdParamSchema = z.object({
  id: z.uuid("Invalid review id"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
