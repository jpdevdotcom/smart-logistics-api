import { Request, Response } from "express";
import { getWarehouseById } from "../models/warehouse.model";
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
