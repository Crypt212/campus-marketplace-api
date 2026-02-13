import redis from "redis";
import environment from "../configs/environment.js";
import { logger } from "./winston.js";

const redisClient = redis.createClient(environment.redis.url);

redisClient.on("error", (err) => logger.error("❌ Redis client error", err));
redisClient.on("connect", () => logger.info("✅ Redis client connected"));
redisClient.on('disconnected', () => logger.error('❌ Redis disconnected'));


export default redisClient;

