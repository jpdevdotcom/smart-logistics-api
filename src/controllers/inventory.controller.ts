import { Request, Response } from "express";
import { addInventory } from "../models/inventory.model";
import { AddInventoryInput } from "../validators/inventory.schema";
import { inventoryView } from "../views/inventory.view";

export const addInventoryHandler = async (req: Request, res: Response) => {
  try {
    const result = await addInventory(req.body as AddInventoryInput);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    if (!result.data) {
      return res.status(500).json({ error: "Inventory data not found." });
    }
    return res.status(200).json(inventoryView(result.data));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
