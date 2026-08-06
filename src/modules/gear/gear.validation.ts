import { z } from "zod";

export const createGearSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  brand: z.string().optional(),
  pricePerDay: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.uuid("Invalid category id"),
});

export const updateGearSchema = createGearSchema.partial().extend({
  isAvailable: z.boolean().optional(),
});

export const gearIdParamSchema = z.object({
  id: z.uuid("Invalid gear item id"),
});

export const gearFilterSchema = z.object({
  categoryId: z.uuid().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateGearInput = z.infer<typeof createGearSchema>;
export type UpdateGearInput = z.infer<typeof updateGearSchema>;
export type GearFilterInput = z.infer<typeof gearFilterSchema>;
