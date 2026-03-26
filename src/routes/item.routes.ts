import { Router } from "express";
import {
  getItemByIdHandler,
  getItemBySkuHandler,
} from "../controllers/item.controller";

const router = Router();

router.get("/:id", getItemByIdHandler);
router.get("/sku/:sku", getItemBySkuHandler);

export default router;
