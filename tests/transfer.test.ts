import "../src/config/env";

import request from "supertest";
import app from "../src/app";
import { beforeAll, describe, expect, it } from "vitest";

import { execSync } from "node:child_process";

beforeAll(() => {
  execSync("npm run prisma:seed", { stdio: "inherit" });
});

describe("POST /inventory/transfer", () => {
  it("successfully transfers stock", async () => {
    const res = await request(app).post("/inventory/transfer").send({
      fromWarehouseId: 1,
      toWarehouseId: 2,
      itemId: 1,
      sku: "ABC-12345-X",
      quantity: 1,
    });

    expect(res.status).toBe(200);
  });

  it("fails on insufficient stock", async () => {
    const res = await request(app).post("/inventory/transfer").send({
      fromWarehouseId: 1,
      toWarehouseId: 2,
      itemId: 1,
      sku: "ABC-12345-X",
      quantity: 99999,
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("INSUFFICIENT_STOCK");
  });

  it("fails on capacity exceeded", async () => {
    const res = await request(app).post("/inventory/transfer").send({
      fromWarehouseId: 1,
      toWarehouseId: 2,
      itemId: 1,
      sku: "ABC-12345-X",
      quantity: 6,
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("INSUFFICIENT_CAPACITY");
  });

  it("fails on SKU mismatch", async () => {
    const res = await request(app).post("/inventory/transfer").send({
      fromWarehouseId: 1,
      toWarehouseId: 2,
      itemId: 1,
      sku: "ZZZ-99999-Z",
      quantity: 1,
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("SKU_MISMATCH");
  });

  it("fails on wrong warehouse type", async () => {
    const res = await request(app).post("/inventory/transfer").send({
      fromWarehouseId: 1,
      toWarehouseId: 2,
      itemId: 2,
      sku: "XYZ-00001-A",
      quantity: 1,
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("INVALID_WAREHOUSE_TYPE");
  });
});
