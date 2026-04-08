import { Router } from "express";
import {
  createItemHandler,
  getItemByIdHandler,
  getItemBySkuHandler,
} from "../controllers/item.controller";
import { validateBody } from "../middleware/validate.middleware";
import { createItemSchema } from "../validators/item.schema";

const router = Router();

router.post("/", validateBody(createItemSchema), createItemHandler);
router.get("/:id", getItemByIdHandler);
router.get("/sku/:sku", getItemBySkuHandler);

export default router;
