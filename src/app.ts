import express from "express";
import cors from "cors";
import { requestLogger } from "./middleware/request-logger.middleware";
import v1Routes from "./routes/v1.routes";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", true);
}

app.use(requestLogger);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", v1Routes);

export default app;
