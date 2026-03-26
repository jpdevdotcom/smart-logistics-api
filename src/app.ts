import express from "express";
import { requestLogger } from "./middleware/request-logger.middleware";
import inventoryRoutes from "./routes/inventory.routes";
import warehouseRoutes from "./routes/warehouse.routes";
import itemRoutes from "./routes/item.routes";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", true);
}

app.use(requestLogger);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/warehouses", warehouseRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/items", itemRoutes);

export default app;
