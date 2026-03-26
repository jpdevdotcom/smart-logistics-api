import prisma from "../utils/prisma";

export const getItemById = async (id: number) => {
  return prisma.item.findUnique({
    where: { id },
  });
};

export const getItemBySku = async (sku: string) => {
  return prisma.item.findUnique({
    where: { sku },
  });
};
