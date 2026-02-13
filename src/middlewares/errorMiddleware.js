import AppError from "../errors/AppError.js";
import { handlePrismaError } from "../utils/prismaErrorHandler.js";
import environment from "../configs/environment.js";

export const globalErrorHandler = (err, req, res, next) => {
  let error = err;

  // Transform Prisma errors
  error = handlePrismaError(error);

  // Unknown error fallback
  if (!(error instanceof AppError)) {
    console.error("UNHANDLED ERROR:", error);

    error = new AppError(
      environment.nodeEnv === "production"
        ? "Something went wrong"
        : error.message,
      500
    );
  }

  // Development response
  if (environment.nodeEnv === "development") {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error,
    });
  }

  // Production response
  return res.status(error.statusCode).json({
    status: error.status,
    message: error.isOperational
      ? error.message
      : "Something went wrong",
  });
};
