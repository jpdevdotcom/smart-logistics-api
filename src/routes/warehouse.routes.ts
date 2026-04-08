import { Router } from "express";
import { validateBody } from "../middleware/validate.middleware";
import {
  createWarehouseHandler,
  deleteWarehouseHandler,
  getAllWarehousesHandler,
  getWarehouseByIdHandler,
} from "../controllers/warehouse.controller";
import { createWarehouseSchema } from "../validators/warehouse.schema";

const router = Router();

router.get("/", getAllWarehousesHandler);
router.post("/", validateBody(createWarehouseSchema), createWarehouseHandler);
router.get("/:id", getWarehouseByIdHandler);
router.delete("/:id", deleteWarehouseHandler);

export default router;
