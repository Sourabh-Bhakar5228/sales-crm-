import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import apiRouter from "./routes/index.js";
import vigilanceRoutes from "./routes/vigilance.routes.js";
import supportRoutes from "./routes/support.routes.js";
import userRoutes from "./routes/user.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan("dev"));

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Vibh-Anu CRM API is running",
  });
});

// Static audio files
const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

// Vigilance specific router
app.use("/api/vigilance", vigilanceRoutes);

// Support router
app.use("/api/support", supportRoutes);

// User router
app.use("/api/users", userRoutes);

// Sales router
app.use("/api/sales", salesRoutes);

// API router
app.use("/api", apiRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
