import prisma from "../utils/prisma";
import { StorageRequirement } from "@prisma/client";

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

export const createItem = async (input: {
  name: string;
  storageRequirement: StorageRequirement;
}) => {
  const { name, storageRequirement } = input;

  const created = await prisma.item.create({
    data: {
      name,
      storageRequirement,
    },
  });

  return { data: created };
};

export const getAllItems = async (input: { page: number; limit: number }) => {
  const { page, limit } = input;
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.item.count(),
    prisma.item.findMany({
      orderBy: { id: "asc" },
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
