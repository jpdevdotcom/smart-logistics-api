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
