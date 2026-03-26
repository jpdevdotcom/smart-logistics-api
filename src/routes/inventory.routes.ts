import { Router } from "express";
import { validateBody } from "../middleware/validate.middleware";
import { addInventorySchema } from "../validators/inventory.schema";
import { addInventoryController } from "../controllers/inventory.controller";

const router = Router();

router.post("/add", validateBody(addInventorySchema), addInventoryController);

export default router;
