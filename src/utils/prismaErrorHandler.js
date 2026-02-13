import { Prisma } from "../libs/prisma/client/client.js";
import { ConflictError, NotFoundError } from "../errors/errors.js";

export const handlePrismaError = (error) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return new ConflictError(
          `Duplicate field value: ${error.meta?.target}`
        );

      case "P2025":
        return new NotFoundError("Record not found");

      default:
        return error;
    }
  }

  return error;
};
