// Import the driver adapter for your specific database (example uses PostgreSQL)
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/prisma/client";
import config from "../config";

// Initialize the adapter according to your driver's requirements
const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });
// Pass the adapter instance to PrismaClient
const prisma = new PrismaClient({ adapter });

export default prisma;
