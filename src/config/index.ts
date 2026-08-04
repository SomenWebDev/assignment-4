import { configDotenv } from "dotenv";
import { env } from "process";

configDotenv();

const config = {
  NODE_ENV: env.NODE_ENV!,
  PORT: env.PORT!,
  APP_URL: env.APP_URL!,
  DATABASE_URL: env.DATABASE_URL!,
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRATION: env.JWT_ACCESS_EXPIRATION!,
  JWT_REFRESH_EXPIRATION: env.JWT_REFRESH_EXPIRATION!,
};

export default config;
