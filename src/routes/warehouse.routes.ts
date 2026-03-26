import { Router } from "express";
import {
  deleteWarehouseHandler,
  getWarehouseByIdHandler,
} from "../controllers/warehouse.controller";

const router = Router();

router.get("/:id", getWarehouseByIdHandler);
router.delete("/:id", deleteWarehouseHandler);

export default router;
