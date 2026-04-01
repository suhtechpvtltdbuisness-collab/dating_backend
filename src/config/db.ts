import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", true);
mongoose.set("bufferTimeoutMS", 10000);

function normalizeMongoUri(uri: string): string {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }

  const [base, query = ""] = uri.split("?");
  const params = new URLSearchParams(query);

  // Atlas requires TLS. If user sets ssl/tls=false, override it.
  if (params.get("ssl") === "false") {
    params.delete("ssl");
  }
  if (params.get("tls") === "false") {
    params.delete("tls");
  }

  if (!params.has("tls") && !params.has("ssl")) {
    params.set("tls", "true");
  }

  if (!params.has("retryWrites")) {
    params.set("retryWrites", "true");
  }

  const normalizedQuery = params.toString();
  return normalizedQuery ? `${base}?${normalizedQuery}` : base;
}

function redactMongoUri(uri: string): string {
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/i, "$1$2:***@");
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isVercelEnv(): boolean {
  return process.env.VERCEL === "1";
}

let listenersAttached = false;

function attachConnectionListeners(): void {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
}

export async function connectDatabase(uri: string): Promise<void> {
  attachConnectionListeners();

  const selectedUri = uri || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!selectedUri) {
    throw new Error("MongoDB URI not configured. Set MONGODB_URI or MONGO_URI");
  }

  const normalizedUri = normalizeMongoUri(selectedUri);
  const maxAttempts = parsePositiveInt(process.env.MONGO_CONNECT_RETRIES, 5);
  const baseDelayMs = parsePositiveInt(process.env.MONGO_RETRY_DELAY_MS, 2000);
  const useIpv4 = (process.env.MONGO_FORCE_IPV4 ?? "true") === "true";

  // Reuse existing healthy connection.
  if (mongoose.connection.readyState === 1) {
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    }
    return;
  }

  // If another request/process is already connecting, wait briefly.
  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Connection wait timeout")),
        10000,
      );

      mongoose.connection.once("connected", async () => {
        clearTimeout(timeout);
        try {
          if (mongoose.connection.db) {
            await mongoose.connection.db.admin().ping();
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      mongoose.connection.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
    return;
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(normalizedUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 5,
        minPoolSize: 0,
        maxIdleTimeMS: 10000,
        family: useIpv4 ? 4 : undefined,
      });

      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      return;
    } catch (error) {
      lastError = error;

      console.error(
        `MongoDB connect attempt ${attempt}/${maxAttempts} failed for ${redactMongoUri(normalizedUri)}`,
      );
      console.error(error);

      if (attempt < maxAttempts) {
        await delay(baseDelayMs * attempt);
      }
    }
  }

  if (isVercelEnv()) {
    throw lastError instanceof Error
      ? new Error(
          `Failed to connect to MongoDB after ${maxAttempts} attempts: ${lastError.message}`,
        )
      : new Error(`Failed to connect to MongoDB after ${maxAttempts} attempts`);
  }

  throw lastError instanceof Error
    ? new Error(
        `Failed to connect to MongoDB after ${maxAttempts} attempts: ${lastError.message}`,
      )
    : new Error(`Failed to connect to MongoDB after ${maxAttempts} attempts`);
}
