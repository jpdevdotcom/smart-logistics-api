import { Request, Response } from "express";
import {
  createWarehouse,
  deleteWarehouse,
  getAllWarehouses,
  getWarehouseById,
} from "../models/warehouse.model";
import { apiError } from "../utils/api-error";
import { warehouseView } from "../views/warehouse.view";
import { CreateWarehouseInput } from "../validators/warehouse.schema";

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

export const createWarehouseHandler = async (req: Request, res: Response) => {
  try {
    const result = await createWarehouse(req.body as CreateWarehouseInput);

    if (!("data" in result) || !result.data) {
      return res
        .status(500)
        .json(
          apiError("INTERNAL_SERVER_ERROR", "Warehouse creation failed.", 500),
        );
    }

    return res.status(201).json(warehouseView(result.data));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(apiError("INTERNAL_SERVER_ERROR", "Internal server error.", 500));
  }
};
export const getAllWarehousesHandler = async (req: Request, res: Response) => {
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
    const result = await getAllWarehouses({ page, limit });
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(apiError("INTERNAL_SERVER_ERROR", "Internal server error.", 500));
  }
};
