import "dotenv/config";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}

import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { seedDefaultUsers } from "./utils/seed.js";

const PORT = Number(process.env.PORT) || 5000;

const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLIENT_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

const startServer = async (): Promise<void> => {
  await connectDatabase();
  await seedDefaultUsers();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
