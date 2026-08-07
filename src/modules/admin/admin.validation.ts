import { z } from "zod";
import { UserStatus } from "../../../prisma/generated/prisma/enums";

export const userIdParamSchema = z.object({
  id: z.uuid("Invalid user id"),
});

export const updateUserStatusSchema = z.object({
  status: z.enum([UserStatus.ACTIVE, UserStatus.SUSPENDED]),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
