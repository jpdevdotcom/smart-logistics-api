import express from "express";
import inventoryRoutes from "./routes/inventory.routes";
import warehouseRoutes from "./routes/warehouse.routes";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/warehouses", warehouseRoutes);
app.use("/inventory", inventoryRoutes);

export default app;
