import initApp from "./app.js";
import environment from "./configs/environment.js";
import prismaClient from "./libs/database.js";
import redisClient from "./libs/redis.js";
import { logger } from "./libs/winston.js";

const startServer = async () => {
    try {
        await redisClient.connect();
        await prismaClient.$connect().then(() => logger.info("✅ Database connected"));
        const app = await initApp();
        app.listen(environment.backend.port, () => logger.info(`✅ Listening on port ${environment.backend.port}`));
    } catch (error) {
        console.error('❌ Error starting server, error: ', error);
    }
};

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
    logger.info('\n👋 Shutting down...');
    process.exit(0);
});

startServer();
