import { WarehouseType } from "@prisma/client";
import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  location: z.string().trim().min(1, "Location is required."),
  maxCapacity: z.number().int().positive("maxCapacity must be positive."),
  type: z.nativeEnum(WarehouseType),
});

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
