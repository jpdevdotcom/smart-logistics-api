import { Request, Response } from "express";
import { deleteWarehouse, getWarehouseById } from "../models/warehouse.model";
import { warehouseView } from "../views/warehouse.view";

export const getWarehouseByIdHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid warehouse id." });
  }

  const warehouse = await getWarehouseById(id);

  if (!warehouse) {
    return res.status(404).json({ error: "Warehouse not found." });
  }

  return res.status(200).json(warehouseView(warehouse));
};

export const deleteWarehouseHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(422).json({
      error: "VALIDATION_ERROR",
      message: "Invalid warehouse id.",
      code: 422,
    });
  }

  const result = await deleteWarehouse(id);

  if ("error" in result && result.error) {
    return res.status(result.code).json(result);
  }

  if (!("data" in result) || !result.data) {
    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Warehouse deletion failed.",
      code: 500,
    });
  }

  return res.status(200).json(warehouseView(result.data));
};
