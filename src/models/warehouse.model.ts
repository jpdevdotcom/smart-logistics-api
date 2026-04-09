import prisma from "../utils/prisma";
import { apiError } from "../utils/api-error";
import { WarehouseType } from "@prisma/client";

export const getWarehouseById = async (id: number) => {
  return prisma.warehouse.findFirst({
    where: { id, deletedAt: null },
    include: { inventory: true },
  });
};

export const deleteWarehouse = async (id: number) => {
  return prisma.$transaction(
    async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: { id, deletedAt: null },
      });

      if (!warehouse) {
        return apiError("WAREHOUSE_NOT_FOUND", "Warehouse not found.", 404);
      }

      const inventoryCount = await tx.inventory.count({
        where: { warehouseId: id, quantity: { gt: 0 } },
      });

      if (inventoryCount > 0) {
        return apiError(
          "INVENTORY_NOT_EMPTY",
          "Warehouse cannot be deleted while inventory exists.",
          422,
        );
      }

      const updated = await tx.warehouse.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { data: updated };
    },
    { isolationLevel: "Serializable" },
  );
};

export const createWarehouse = async (input: {
  name: string;
  location: string;
  maxCapacity: number;
  type: WarehouseType;
}) => {
  const { name, location, maxCapacity, type } = input;

  const created = await prisma.warehouse.create({
    data: {
      name,
      location,
      maxCapacity,
      type,
    },
  });

  return { data: created };
};

export const getAllWarehouses = async (input: {
  page: number;
  limit: number;
}) => {
  const { page, limit } = input;
  const skip = (page - 1) * limit;

  const [total, warehouses] = await Promise.all([
    prisma.warehouse.count({ where: { deletedAt: null } }),
    prisma.warehouse.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: warehouses,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
