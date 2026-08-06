import { z } from "zod";

const rentalItemSchema = z.object({
  gearItemId: z.uuid("Invalid gear item id"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
});

export const createRentalSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    items: z.array(rentalItemSchema).min(1, "At least one item is required"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return data.startDate >= today;
    },
    { message: "Start date cannot be in the past", path: ["startDate"] },
  )
  .refine(
    (data) => {
      const ids = data.items.map((i) => i.gearItemId);
      return new Set(ids).size === ids.length;
    },
    {
      message: "Duplicate gear items are not allowed in one order",
      path: ["items"],
    },
  );

export const updateRentalStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "PICKED_UP", "RETURNED"]),
});

export const rentalIdParamSchema = z.object({
  id: z.uuid("Invalid rental order id"),
});

export type CreateRentalInput = z.infer<typeof createRentalSchema>;
export type UpdateRentalStatusInput = z.infer<typeof updateRentalStatusSchema>;
