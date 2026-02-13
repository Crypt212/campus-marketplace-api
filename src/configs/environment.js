import "dotenv/config";

const nodeEnv = process.env.NODE_ENV || 'development';

const backend = {
    port: parseInt(process.env.PORT, 10),
}
const frontend = {
    url: process.env.FRONTEND_URL,
}

const database = {
    url: process.env.DATABASE_URL,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,
    ssl: process.env.DB_SSL === 'true',
}

const redis = {
    url: process.env.REDIS_URL,
    ttl: parseInt(process.env.REDIS_TTL) || 3600,
};

const jwt = {
    accessToken: {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '24h',
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }
};

const api = {
    baseUrl: process.env.API_BASE_URL,
    version: process.env.API_VERSION || 'v1',
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    },
};

const logging = {
    level: process.env.LOGGING_LEVEL || 'info',
    enableFileLogs: process.env.ENABLE_FILE_LOGS === 'true',
};

const whatsapp = {
    apiKey: process.env.WHATSAPP_API_KEY,
}


const environment = {
    nodeEnv,
    backend,
    frontend,
    redis,
    database,
    jwt,
    api,
    logging,
    whatsapp,
};

Object.freeze(environment);
export default environment;
