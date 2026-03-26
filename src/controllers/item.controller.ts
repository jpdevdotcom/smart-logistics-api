import { Request, Response } from "express";
import { getItemById, getItemBySku } from "../models/item.model";
import { itemView } from "../views/item.view";

export const getItemByIdHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid item id." });
  }

  const item = await getItemById(id);

  if (!item) {
    return res.status(404).json({ error: "Item not found." });
  }

  return res.status(200).json(itemView(item));
};

export const getItemBySkuHandler = async (req: Request, res: Response) => {
  const sku = req.params.sku;

  const item = await getItemBySku(sku as string);

  if (!item) {
    return res.status(404).json({ error: "Item not found." });
  }

  return res.status(200).json(itemView(item));
};
