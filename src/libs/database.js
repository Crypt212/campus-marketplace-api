import { PrismaClient } from "./prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import environment from "../configs/environment.js";

const pool = new pg.Pool({
    connectionString: environment.database.url,
    ssl: {
        rejectUnauthorized: false,
    },
});
const adapter = new PrismaPg(pool);
const prismaClient = new PrismaClient({ adapter });

export default prismaClient;
