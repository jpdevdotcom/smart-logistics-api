import prisma from "../utils/prisma";

export const getWarehouseById = async (id: number) => {
  return prisma.warehouse.findUnique({
    where: { id },
    include: { inventory: true },
  });
};
