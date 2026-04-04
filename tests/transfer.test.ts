import "../src/config/env";

import request from "supertest";
import app from "../src/app";
import { beforeAll, describe, expect, it } from "vitest";
import prisma from "../src/utils/prisma";
import { StorageRequirement, WarehouseType } from "@prisma/client";

import { execSync } from "node:child_process";

let standardInventory: {
  warehouseId: number;
  itemId: number;
  quantity: number;
  sku: string;
};
let standardDestWarehouseId: number;
let capacityDestWarehouseId: number;
let coldInventory: {
  warehouseId: number;
  itemId: number;
  sku: string;
};
let standardWarehouseId: number;

beforeAll(async () => {
  execSync("npm run prisma:seed", { stdio: "inherit" });

  const standardInv = await prisma.inventory.findFirst({
    where: {
      item: { storageRequirement: StorageRequirement.STANDARD },
      warehouse: { type: WarehouseType.STANDARD },
    },
    include: { item: true, warehouse: true },
    orderBy: { id: "asc" },
  });

  if (!standardInv) {
    throw new Error("No standard inventory row found in seed data.");
  }

  const standardDest = await prisma.warehouse.findFirst({
    where: {
      type: WarehouseType.STANDARD,
      id: { not: standardInv.warehouseId },
    },
    orderBy: { id: "asc" },
  });

  if (!standardDest) {
    throw new Error("No standard destination warehouse found.");
  }

  const capacityDest = await prisma.warehouse.findFirst({
    where: {
      type: WarehouseType.STANDARD,
      id: { notIn: [standardInv.warehouseId, standardDest.id] },
    },
    orderBy: { id: "asc" },
  });

  if (!capacityDest) {
    throw new Error("No capacity-test destination warehouse found.");
  }

  const coldInv = await prisma.inventory.findFirst({
    where: {
      item: { storageRequirement: StorageRequirement.COLD },
      warehouse: { type: WarehouseType.COLD_STORAGE },
    },
    include: { item: true, warehouse: true },
    orderBy: { id: "asc" },
  });

  if (!coldInv) {
    throw new Error("No cold inventory row found in seed data.");
  }

  const standardWarehouse = await prisma.warehouse.findFirst({
    where: { type: WarehouseType.STANDARD },
    orderBy: { id: "asc" },
  });

  if (!standardWarehouse) {
    throw new Error("No standard warehouse found for cold-item test.");
  }

  standardInventory = {
    warehouseId: standardInv.warehouseId,
    itemId: standardInv.itemId,
    quantity: standardInv.quantity,
    sku: standardInv.item.sku,
  };
  standardDestWarehouseId = standardDest.id;
  capacityDestWarehouseId = capacityDest.id;
  coldInventory = {
    warehouseId: coldInv.warehouseId,
    itemId: coldInv.itemId,
    sku: coldInv.item.sku,
  };
  standardWarehouseId = standardWarehouse.id;
});

describe("POST /api/v1/inventory/transfer", () => {
  it("successfully transfers stock", async () => {
    const res = await request(app).post("/api/v1/inventory/transfer").send({
      fromWarehouseId: standardInventory.warehouseId,
      toWarehouseId: standardDestWarehouseId,
      itemId: standardInventory.itemId,
      sku: standardInventory.sku,
      quantity: 1,
    });

    expect(res.status).toBe(200);
  });

  it("fails on insufficient stock", async () => {
    const res = await request(app).post("/api/v1/inventory/transfer").send({
      fromWarehouseId: standardInventory.warehouseId,
      toWarehouseId: standardDestWarehouseId,
      itemId: standardInventory.itemId,
      sku: standardInventory.sku,
      quantity: standardInventory.quantity + 1,
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("INSUFFICIENT_STOCK");
  });

  it("fails on capacity exceeded", async () => {
    const destSum = await prisma.inventory.aggregate({
      _sum: { quantity: true },
      where: { warehouseId: capacityDestWarehouseId },
    });

    const current = destSum._sum.quantity ?? 0;

    await prisma.warehouse.update({
      where: { id: capacityDestWarehouseId },
      data: { maxCapacity: current },
    });

    const res = await request(app).post("/api/v1/inventory/transfer").send({
      fromWarehouseId: standardInventory.warehouseId,
      toWarehouseId: capacityDestWarehouseId,
      itemId: standardInventory.itemId,
      sku: standardInventory.sku,
      quantity: 1,
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("INSUFFICIENT_CAPACITY");
  });

  it("fails on SKU mismatch", async () => {
    const res = await request(app).post("/api/v1/inventory/transfer").send({
      fromWarehouseId: standardInventory.warehouseId,
      toWarehouseId: standardDestWarehouseId,
      itemId: standardInventory.itemId,
      sku: "ZZZ-99999-Z",
      quantity: 1,
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("SKU_MISMATCH");
  });

  it("fails on wrong warehouse type", async () => {
    const res = await request(app).post("/api/v1/inventory/transfer").send({
      fromWarehouseId: coldInventory.warehouseId,
      toWarehouseId: standardWarehouseId,
      itemId: coldInventory.itemId,
      sku: coldInventory.sku,
      quantity: 1,
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("INVALID_WAREHOUSE_TYPE");
  });
});
