import express from "express";
import inventoryRoutes from "./routes/inventory.routes";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/inventory", inventoryRoutes);

export default app;
