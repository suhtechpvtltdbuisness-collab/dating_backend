import mongoose from "mongoose";

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

  const normalizedQuery = params.toString();
  return normalizedQuery ? `${base}?${normalizedQuery}` : base;
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

  const normalizedUri = normalizeMongoUri(uri);
  await mongoose.connect(normalizedUri, {
    serverSelectionTimeoutMS: 10000,
  });
}
