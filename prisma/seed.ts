import "dotenv/config";
import {
  PrismaClient,
  WarehouseType,
  StorageRequirement,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "inventory" RESTART IDENTITY CASCADE',
  );
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "items" RESTART IDENTITY CASCADE',
  );
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "warehouses" RESTART IDENTITY CASCADE',
  );

  // warehouses
  const w1 = await prisma.warehouse.create({
    data: {
      name: "Warehouse A",
      location: "Manila",
      maxCapacity: 100,
      type: WarehouseType.STANDARD,
    },
  });

  const w2 = await prisma.warehouse.create({
    data: {
      name: "Warehouse B",
      location: "Cebu",
      maxCapacity: 50,
      type: WarehouseType.STANDARD,
    },
  });

  // items
  const item1 = await prisma.item.create({
    data: {
      name: "Widget",
      sku: "ABC-12345-X",
      storageRequirement: StorageRequirement.STANDARD,
    },
  });

  const coldItem = await prisma.item.create({
    data: {
      name: "Freezer",
      sku: "XYZ-00001-A",
      storageRequirement: StorageRequirement.COLD,
    },
  });

  // inventory
  await prisma.inventory.create({
    data: {
      warehouseId: w1.id,
      itemId: item1.id,
      quantity: 20,
    },
  });

  // cold item stock in warehouse A for type-check test
  await prisma.inventory.create({
    data: {
      warehouseId: w1.id,
      itemId: coldItem.id,
      quantity: 5,
    },
  });

  // give some stock in warehouse B to test capacity
  await prisma.inventory.create({
    data: {
      warehouseId: w2.id,
      itemId: item1.id,
      quantity: 45,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
