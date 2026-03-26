import { Request, Response } from "express";
import {
  addInventory,
  getInventoryById,
  getInventoryReport,
} from "../models/inventory.model";
import { AddInventoryInput } from "../validators/inventory.schema";
import {
  inventoryDetailView,
  inventoryReportView,
  inventoryView,
} from "../views/inventory.view";

export const addInventoryController = async (req: Request, res: Response) => {
  try {
    const result = await addInventory(req.body as AddInventoryInput);

    if ("error" in result && result.error) {
      return res.status(result.code).json(result);
    }

    if (!("data" in result) || !result.data) {
      return res.status(500).json({ error: "Inventory data not found." });
    }
    return res.status(200).json(inventoryView(result.data));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

import { transferInventory } from "../models/inventory.model";
import { TransferInventoryInput } from "../validators/inventory.schema";
import { transferView } from "../views/inventory.view";

export const transferInventoryHandler = async (req: Request, res: Response) => {
  try {
    const result = await transferInventory(req.body as TransferInventoryInput);

    if ("error" in result && result.error) {
      return res.status(result.code).json(result);
    }

    if (!("data" in result) || !result.data) {
      return res.status(500).json({ error: "Transfer result not found." });
    }

    return res.status(200).json(transferView(result.data));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
export const inventoryReportHandler = async (_req: Request, res: Response) => {
  try {
    const report = await getInventoryReport();
    return res.status(200).json(inventoryReportView(report));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getInventoryByIdHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid inventory id." });
  }

  const inventory = await getInventoryById(id);

  if (!inventory) {
    return res.status(404).json({ error: "Inventory not found." });
  }

  return res.status(200).json(inventoryDetailView(inventory));
};
