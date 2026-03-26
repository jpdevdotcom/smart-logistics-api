import { Inventory } from "@prisma/client";

export const inventoryView = (inventory: Inventory) => ({
  id: inventory.id,
  warehouseId: inventory.warehouseId,
  itemId: inventory.itemId,
  quantity: inventory.quantity,
  createdAt: inventory.createdAt,
  updatedAt: inventory.updatedAt,
});
