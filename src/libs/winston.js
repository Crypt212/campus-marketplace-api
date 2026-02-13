import winston from "winston";
import environment from "../configs/environment.js";

const { combine, timestamp, errors, json } = winston.format;

const format = environment.nodeEnv === "production" ?
    json() : combine(timestamp(), errors({ stack: true }), json());
export const logger = winston.createLogger({
    level: environment.logging.level || "info",
    format: format,
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/standard.log" })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: "logs/exceptions.log" })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: "logs/rejections.log" })
    ],
    defaultMeta: { service: "motqen-backend" },
});
