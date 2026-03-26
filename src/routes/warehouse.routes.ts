import { Router } from "express";
import { getWarehouseByIdHandler } from "../controllers/warehouse.controller";

const router = Router();

router.get("/:id", getWarehouseByIdHandler);

export default router;
