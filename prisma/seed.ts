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

  // warehouses (20)
  const warehouses = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      prisma.warehouse.create({
        data: {
          name: `Warehouse ${i + 1}`,
          location: i % 2 === 0 ? "Manila" : "Cebu",
          maxCapacity: 100 + i * 5,
          type:
            i % 5 === 0 ? WarehouseType.COLD_STORAGE : WarehouseType.STANDARD,
        },
      }),
    ),
  );

  // items (20)
  const items = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      prisma.item.create({
        data: {
          name: `Item ${i + 1}`,
          sku: `SKU-${String(i + 1).padStart(5, "0")}-X`,
          storageRequirement:
            i % 5 === 0 ? StorageRequirement.COLD : StorageRequirement.STANDARD,
        },
      }),
    ),
  );

  // inventory (20 rows, 1-to-1)
  await Promise.all(
    Array.from({ length: 20 }, (_, i) => {
      const warehouse = warehouses[i];
      const item = items[i];
      if (!warehouse || !item) {
        throw new Error(`Missing warehouse or item at index ${i}`);
      }
      return prisma.inventory.create({
        data: {
          warehouseId: warehouse.id,
          itemId: item.id,
          quantity: 10 + i,
        },
      });
    }),
  );

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
