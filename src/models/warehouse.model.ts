import prisma from "../utils/prisma";
import { apiError } from "../utils/api-error";

export const getWarehouseById = async (id: number) => {
  return prisma.warehouse.findFirst({
    where: { id, deletedAt: null },
    include: { inventory: true },
  });
};

export const deleteWarehouse = async (id: number) => {
  const warehouse = await prisma.warehouse.findFirst({
    where: { id, deletedAt: null },
  });

  if (!warehouse) {
    return apiError("WAREHOUSE_NOT_FOUND", "Warehouse not found.", 404);
  }

  const inventoryCount = await prisma.inventory.count({
    where: { warehouseId: id, quantity: { gt: 0 } },
  });

  if (inventoryCount > 0) {
    return apiError(
      "INVENTORY_NOT_EMPTY",
      "Warehouse cannot be deleted while inventory exists.",
      422,
    );
  }

  const updated = await prisma.warehouse.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { data: updated };
};
