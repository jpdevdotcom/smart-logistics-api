import { Request, Response } from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  getItemBySku,
} from "../models/item.model";
import { apiError } from "../utils/api-error";
import { itemView } from "../views/item.view";
import { CreateItemInput } from "../validators/item.schema";

export const getItemByIdHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res
      .status(400)
      .json(apiError("VALIDATION_ERROR", "Invalid item id.", 400));
  }

  const item = await getItemById(id);

  if (!item) {
    return res
      .status(404)
      .json(apiError("ITEM_NOT_FOUND", "Item not found.", 404));
  }

  return res.status(200).json(itemView(item));
};

export const getItemBySkuHandler = async (req: Request, res: Response) => {
  const sku = req.params.sku;

  const item = await getItemBySku(sku as string);

  if (!item) {
    return res
      .status(404)
      .json(apiError("ITEM_NOT_FOUND", "Item not found.", 404));
  }

  return res.status(200).json(itemView(item));
};

export const createItemHandler = async (req: Request, res: Response) => {
  try {
    const result = await createItem(req.body as CreateItemInput);

    if (!("data" in result) || !result.data) {
      return res
        .status(500)
        .json(apiError("INTERNAL_SERVER_ERROR", "Item creation failed.", 500));
    }

    return res.status(201).json(itemView(result.data));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(apiError("INTERNAL_SERVER_ERROR", "Internal server error.", 500));
  }
};
export const getAllItemsHandler = async (req: Request, res: Response) => {
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
    const result = await getAllItems({ page, limit });
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(apiError("INTERNAL_SERVER_ERROR", "Internal server error.", 500));
  }
};
