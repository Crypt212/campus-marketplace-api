import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import mainRouter from "./routes/api.js";
import { globalErrorHandler } from "./middlewares/errorMiddleware.js";
import redisClient from "./libs/redis.js";
import environment from "./configs/environment.js";
import  prismaClient  from "./libs/database.js";

const initApp = async () => {
  const app = express();

  app.use(express.json());
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: environment.api.rateLimit.windowMs,
      limit: environment.api.rateLimit.max,
      legacyHeaders: false,
    }),
  );
  app.use(
    cors({
      origin: function (origin, callback) {
        callback(null, environment.frontend.url);
      },
    }),
  );

  app.use("/api", mainRouter);

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date(),
      database: prismaClient ? "connected" : "disconnected",
      redis: redisClient.isReady ? "connected" : "disconnected",
    });
  });

  app.use(globalErrorHandler);

  app.use((_, res) => {
    res.status(404).json({ error: "Route not found" });
  });



  return app;
};

export default initApp;
