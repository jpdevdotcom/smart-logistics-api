import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

const logDir = path.resolve(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getLogFile = () => {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(logDir, `requests-${date}.log`);
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const ip = req.ip;

    // Prevent log request body or headers (sensitive)
    const line = [
      new Date().toISOString(),
      req.method,
      req.originalUrl,
      res.statusCode,
      `${durationMs}ms`,
      ip,
    ].join(" ");

    fs.appendFile(getLogFile(), line + "\n", (err) => {
      if (err) {
        console.error("Failed to write request log:", err);
      }
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(line);
    }
  });

  next();
};
