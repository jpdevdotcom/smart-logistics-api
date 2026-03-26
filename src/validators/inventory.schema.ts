import { z } from "zod";

export const addInventorySchema = z.object({
  warehouseId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export type AddInventoryInput = z.infer<typeof addInventorySchema>;
