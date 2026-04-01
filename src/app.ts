import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import userRouter from "./routes/user.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

function getDbStatus(): string {
  const stateMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return stateMap[mongoose.connection.readyState] ?? "unknown";
}

function healthResponse() {
  return {
    status: "ok",
    db: {
      status: getDbStatus(),
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

app.get("/", (_req, res) => {
  const payload = healthResponse();
  const isHealthy = payload.db.status === "connected";
  res.status(isHealthy ? 200 : 503).json(payload);
});

app.get("/health", (_req, res) => {
  const payload = healthResponse();
  const isHealthy = payload.db.status === "connected";
  res.status(isHealthy ? 200 : 503).json(payload);
});

app.use("/users", userRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
