import { configDotenv } from "dotenv";
import type { SignOptions } from "jsonwebtoken";
import { env } from "process";

configDotenv();

const config = {
  NODE_ENV: env.NODE_ENV!,
  PORT: env.PORT!,
  APP_URL: env.APP_URL!,
  DATABASE_URL: env.DATABASE_URL!,
  BCRYPT_SALT_ROUNDS: env.BCRYPT_SALT_ROUNDSs,
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET!,
  STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY!,
};

export default config;
