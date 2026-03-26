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

      if (!warehouse && !item) {
        return { error: "Warehouse and Item not found.", status: 404 };
      }
      if (!warehouse) {
        return { error: "Warehouse not found.", status: 404 };
      }
      if (!item) {
        return { error: "Item not found.", status: 404 };
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

export const transferInventory = async (input: {
  fromWarehouseId: number;
  toWarehouseId: number;
  itemId: number;
  sku: string;
  quantity: number;
}) => {
  const { fromWarehouseId, toWarehouseId, itemId, sku, quantity } = input;

  if (fromWarehouseId === toWarehouseId) {
    return {
      error: "Source and destination warehouses must be different.",
      status: 400,
    };
  }

  return prisma.$transaction(
    async (tx) => {
      const item = await tx.item.findUnique({ where: { id: itemId } });

      if (!item) {
        return { error: "Item not found.", status: 404 };
      }

      // Ghost stock check: ensure SKU matches the item
      if (item.sku !== sku) {
        return { error: "SKU does not match the item.", status: 400 };
      }

      const [fromWarehouse, toWarehouse] = await Promise.all([
        tx.warehouse.findUnique({ where: { id: fromWarehouseId } }),
        tx.warehouse.findUnique({ where: { id: toWarehouseId } }),
      ]);

      if (!fromWarehouse) {
        return { error: "Source warehouse not found.", status: 404 };
      }

      if (!toWarehouse) {
        return { error: "Destination warehouse not found.", status: 404 };
      }

      // Check source stock
      const sourceInventory = await tx.inventory.findUnique({
        where: { warehouseId_itemId: { warehouseId: fromWarehouseId, itemId } },
      });

      if (!sourceInventory || sourceInventory.quantity < quantity) {
        return {
          error: "Insufficient stock in source warehouse.",
          status: 400,
        };
      }

      // Type check for destination
      if (
        item.storageRequirement === StorageRequirement.COLD &&
        toWarehouse.type === WarehouseType.STANDARD
      ) {
        return {
          error: "Cold items cannot be stored in a Standard warehouse.",
          status: 400,
        };
      }

      // Capacity check for destination
      const destSum = await tx.inventory.aggregate({
        _sum: { quantity: true },
        where: { warehouseId: toWarehouseId },
      });

      const destCurrent = destSum._sum.quantity ?? 0;
      if (destCurrent + quantity > toWarehouse.maxCapacity) {
        return {
          error: "Destination warehouse capacity exceeded.",
          status: 400,
        };
      }

      // Update source (decrement, delete if zero)
      const newSourceQty = sourceInventory.quantity - quantity;

      if (newSourceQty === 0) {
        await tx.inventory.delete({
          where: {
            warehouseId_itemId: { warehouseId: fromWarehouseId, itemId },
          },
        });
      } else {
        await tx.inventory.update({
          where: {
            warehouseId_itemId: { warehouseId: fromWarehouseId, itemId },
          },
          data: { quantity: newSourceQty },
        });
      }

      // Update destination (upsert)
      const destInventory = await tx.inventory.upsert({
        where: { warehouseId_itemId: { warehouseId: toWarehouseId, itemId } },
        create: { warehouseId: toWarehouseId, itemId, quantity },
        update: { quantity: { increment: quantity } },
      });

      return {
        data: {
          from: {
            warehouseId: fromWarehouseId,
            itemId,
            quantity: newSourceQty,
          },
          to: destInventory,
        },
      };
    },
    { isolationLevel: "Serializable" },
  );
};
