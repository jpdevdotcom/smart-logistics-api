import { Inventory, Item, Warehouse } from "@prisma/client";

export const inventoryView = (inventory: Inventory) => ({
  id: inventory.id,
  warehouseId: inventory.warehouseId,
  itemId: inventory.itemId,
  quantity: inventory.quantity,
  createdAt: inventory.createdAt,
  updatedAt: inventory.updatedAt,
});

export const transferView = (payload: {
  from: { warehouseId: number; itemId: number; quantity: number };
  to: Inventory;
}) => ({
  from: payload.from,
  to: inventoryView(payload.to),
});

export const inventoryReportView = (
  report: Array<{
    warehouseId: number;
    name: string;
    location: string;
    type: string;
    totalCapacity: number;
    currentOccupancy: number;
    percentFull: number;
    items: Array<{
      itemId: number;
      name: string;
      sku: string;
      storageRequirement: string;
      quantity: number;
      lowStock: boolean;
    }>;
  }>,
) => report;

export const inventoryDetailView = (
  inventory: Inventory & {
    item: Item;
    warehouse: Warehouse;
  },
) => ({
  id: inventory.id,
  quantity: inventory.quantity,
  warehouse: {
    id: inventory.warehouse.id,
    name: inventory.warehouse.name,
    location: inventory.warehouse.location,
    type: inventory.warehouse.type,
  },
  item: {
    id: inventory.item.id,
    name: inventory.item.name,
    sku: inventory.item.sku,
    storageRequirement: inventory.item.storageRequirement,
  },
  createdAt: inventory.createdAt,
  updatedAt: inventory.updatedAt,
});
