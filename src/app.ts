import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import chatHistoryRouter from "./routes/chat-history.routes";
import chatUsersRouter from "./routes/chat-users.routes";
import chatRouter from "./routes/chat.routes";
import notificationRouter from "./routes/notification.routes";
import profileRouter from "./routes/profile.routes";
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
  const dbStatus = getDbStatus();
  return {
    status: dbStatus === "connected" ? "ok" : "degraded",
    db: {
      status: dbStatus,
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

async function ensureDbConnection(): Promise<void> {
  if (
    mongoose.connection.readyState === 1 ||
    mongoose.connection.readyState === 2
  ) {
    return;
  }
  await connectDatabase(env.mongoUri);
}

app.get("/", async (_req, res) => {
  try {
    await ensureDbConnection();
  } catch (error) {
    console.error("Health check DB connection failed", error);
  }

  const payload = healthResponse();
  const isHealthy = payload.db.status === "connected";
  res.status(isHealthy ? 200 : 503).json(payload);
});

app.get("/health", async (_req, res) => {
  try {
    await ensureDbConnection();
  } catch (error) {
    console.error("Health check DB connection failed", error);
  }

  const payload = healthResponse();
  const isHealthy = payload.db.status === "connected";
  res.status(isHealthy ? 200 : 503).json(payload);
});

app.use("/users", async (_req, _res, next) => {
  try {
    await ensureDbConnection();
    next();
  } catch (error) {
    next(error);
  }
});
app.use("/users", userRouter);

app.use(
  ["/chats", "/profile", "/notifications", "/chat-users", "/chat-history"],
  async (_req, _res, next) => {
    try {
      await ensureDbConnection();
      next();
    } catch (error) {
      next(error);
    }
  },
);

app.use("/chats", chatRouter);
app.use("/profile", profileRouter);
app.use("/notifications", notificationRouter);
app.use("/chat-users", chatUsersRouter);
app.use("/chat-history", chatHistoryRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
