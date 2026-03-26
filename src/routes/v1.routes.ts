import { Router } from "express";
import inventoryRoutes from "./inventory.routes";
import warehouseRoutes from "./warehouse.routes";
import itemRoutes from "./item.routes";

const router = Router();

router.use("/warehouses", warehouseRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/items", itemRoutes);

export default router;
