import { Router } from "express";
import { validateBody } from "../middleware/validate.middleware";
import { addInventorySchema } from "../validators/inventory.schema";
import { addInventory } from "../models/inventory.model";

const router = Router();

router.post("/add", validateBody(addInventorySchema), addInventory);

export default router;
