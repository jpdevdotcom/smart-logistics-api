import { Request, Response } from "express";
import { deleteWarehouse, getWarehouseById } from "../models/warehouse.model";
import { apiError } from "../utils/api-error";
import { warehouseView } from "../views/warehouse.view";

export const getWarehouseByIdHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res
      .status(400)
      .json(apiError("VALIDATION_ERROR", "Invalid warehouse id.", 400));
  }

  const warehouse = await getWarehouseById(id);

  if (!warehouse) {
    return res
      .status(404)
      .json(apiError("WAREHOUSE_NOT_FOUND", "Warehouse not found.", 404));
  }

  return res.status(200).json(warehouseView(warehouse));
};

export const deleteWarehouseHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res
      .status(422)
      .json(apiError("VALIDATION_ERROR", "Invalid warehouse id.", 422));
  }

  const result = await deleteWarehouse(id);

  if ("error" in result && result.error) {
    return res.status(result.code).json(result);
  }

  if (!("data" in result) || !result.data) {
    return res
      .status(500)
      .json(
        apiError("INTERNAL_SERVER_ERROR", "Warehouse deletion failed.", 500),
      );
  }

  return res.status(200).json(warehouseView(result.data));
};
