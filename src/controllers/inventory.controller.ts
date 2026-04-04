import { Request, Response } from "express";
import { apiError } from "../utils/api-error";
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
import { transferInventory } from "../models/inventory.model";
import { TransferInventoryInput } from "../validators/inventory.schema";
import { transferView } from "../views/inventory.view";

export const addInventoryController = async (req: Request, res: Response) => {
  try {
    const result = await addInventory(req.body as AddInventoryInput);

    if ("error" in result && result.error) {
      return res.status(result.code).json(result);
    }

    if (!("data" in result) || !result.data) {
      return res
        .status(500)
        .json(
          apiError(
            "INTERNAL_SERVER_ERROR",
            "Inventory data not found.",
            500,
          ),
        );
    }
    return res.status(200).json(inventoryView(result.data));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(apiError("INTERNAL_SERVER_ERROR", "Internal server error.", 500));
  }
};

export const transferInventoryHandler = async (req: Request, res: Response) => {
  try {
    const result = await transferInventory(req.body as TransferInventoryInput);

    if ("error" in result && result.error) {
      return res.status(result.code).json(result);
    }

    if (!("data" in result) || !result.data) {
      return res
        .status(500)
        .json(
          apiError(
            "INTERNAL_SERVER_ERROR",
            "Transfer result not found.",
            500,
          ),
        );
    }

    return res.status(200).json(transferView(result.data));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(apiError("INTERNAL_SERVER_ERROR", "Internal server error.", 500));
  }
};
export const inventoryReportHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? "1");
  const limit = Number(req.query.limit ?? "20");

  if (!Number.isInteger(page) || page < 1) {
    return res
      .status(422)
      .json(apiError("VALIDATION_ERROR", "page must be >= 1.", 422));
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res
      .status(422)
      .json(
        apiError("VALIDATION_ERROR", "limit must be between 1 and 100.", 422),
      );
  }

  try {
    const report = await getInventoryReport({ page, limit });
    return res.status(200).json(inventoryReportView(report));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(apiError("INTERNAL_SERVER_ERROR", "Internal server error.", 500));
  }
};

export const getInventoryByIdHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res
      .status(400)
      .json(apiError("VALIDATION_ERROR", "Invalid inventory id.", 400));
  }

  const inventory = await getInventoryById(id);

  if (!inventory) {
    return res
      .status(404)
      .json(apiError("INVENTORY_NOT_FOUND", "Inventory not found.", 404));
  }

  return res.status(200).json(inventoryDetailView(inventory));
};
