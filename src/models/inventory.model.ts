import prisma from "../utils/prisma";
import { StorageRequirement, WarehouseType } from "@prisma/client";

export const addInventory = async (input: {
  warehouseId: number;
  itemId: number;
  quantity: number;
}) => {
  const { warehouseId, itemId, quantity } = input;

  return prisma.$transaction(
    async (tx) => {
      const [warehouse, item] = await Promise.all([
        tx.warehouse.findUnique({ where: { id: warehouseId } }),
        tx.item.findUnique({ where: { id: itemId } }),
      ]);

      if (!warehouse || !item) {
        return { error: "Warehouse or item not found.", status: 404 };
      }

      // Rule 1: Cold items cannot go into Standard warehouse
      if (
        item.storageRequirement === StorageRequirement.COLD &&
        warehouse.type === WarehouseType.STANDARD
      ) {
        return {
          error: "Cold items cannot be stored in a Standard warehouse.",
          status: 400,
        };
      }

      // Rule 2: Capacity check
      const sum = await tx.inventory.aggregate({
        _sum: { quantity: true },
        where: { warehouseId },
      });

      const currentQty = sum._sum.quantity ?? 0;
      if (currentQty + quantity > warehouse.maxCapacity) {
        return {
          error: "Warehouse capacity exceeded.",
          status: 400,
        };
      }

      const updated = await tx.inventory.upsert({
        where: { warehouseId_itemId: { warehouseId, itemId } },
        create: { warehouseId, itemId, quantity },
        update: { quantity: { increment: quantity } },
      });

      return { data: updated };
    },
    { isolationLevel: "Serializable" },
  );
};
