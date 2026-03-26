import { z } from "zod";

export const addInventorySchema = z.object({
  warehouseId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  quantity: z.number().int().positive("Quantity must be a positive integer."),
});

export const transferInventorySchema = z.object({
  fromWarehouseId: z.number().int().positive(),
  toWarehouseId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  sku: z.string().regex(/^[A-Z]{3}-\d{5}-[A-Z]$/, "Invalid SKU format."),
  quantity: z.number().int().positive(),
});

export type AddInventoryInput = z.infer<typeof addInventorySchema>;
export type TransferInventoryInput = z.infer<typeof transferInventorySchema>;
