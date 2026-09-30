import mongoose from "mongoose";
import dns from "dns";

// Ensure Windows resolves MongoDB SRV records reliably using Google/Cloudflare DNS
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}

let mongoMemoryServer: any = null;

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MONGO_URI is not defined");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true,
    });

    console.log(`✅ MongoDB connected to ${conn.connection.host}/${conn.connection.name}`);
  } catch (primaryError: any) {
    // If optional direct fallback URI is provided in environment variables, try that
    const directFallbackUri = process.env.MONGO_DIRECT_URI;
    if (directFallbackUri && primaryError?.code === "ECONNREFUSED" && primaryError?.syscall === "querySrv") {
      console.warn("⚠️ SRV query blocked. Retrying with direct connection from MONGO_DIRECT_URI...");
      try {
        const conn = await mongoose.connect(directFallbackUri, {
          serverSelectionTimeoutMS: 10000,
          autoIndex: true,
        });
        console.log(`✅ MongoDB connected to ${conn.connection.host}/${conn.connection.name}`);
        return;
      } catch (directErr) {
        console.warn("Direct connection fallback failed:", directErr);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ Starting In-Memory MongoDB fallback for local development...");
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();

        await mongoose.connect(memUri, { autoIndex: true });
        console.log(`✅ In-Memory MongoDB connected successfully at ${memUri}`);
        return;
      } catch (memError) {
        console.error("❌ In-memory MongoDB failed:", memError);
      }
    }

    console.error("❌ MongoDB connection failed:", primaryError);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB connection lost.");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB runtime error:", err);
});
