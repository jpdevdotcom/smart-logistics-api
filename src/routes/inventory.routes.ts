import { Router } from "express";
import { validateBody } from "../middleware/validate.middleware";
import {
  addInventorySchema,
  transferInventorySchema,
} from "../validators/inventory.schema";
import {
  addInventoryController,
  transferInventoryHandler,
} from "../controllers/inventory.controller";

const router = Router();

router.post("/add", validateBody(addInventorySchema), addInventoryController);
router.post(
  "/transfer",
  validateBody(transferInventorySchema),
  transferInventoryHandler,
);

export default router;
