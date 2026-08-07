import cookieParser from "cookie-parser";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { notFoundHandler } from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import config from "./config";
import cors from "cors";
import authRouter from "./modules/auth/auth.route";
import gearRouter from "./modules/gear/gear.route";
import categoryRouter from "./modules/category/category.route";
import rentalRouter from "./modules/rental/rental.route";

import paymentRouter from "./modules/payment/payment.route";
import { stripeWebhook } from "./modules/payment/payment.controller";

const app: Application = express();
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.APP_URL,
    credentials: true,
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World?");
});
app.use("/api/auth", authRouter);
app.use("/api/gear", gearRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/rentals", rentalRouter);
app.use("/api/payments", paymentRouter);

app.use(notFoundHandler);

app.use(globalErrorHandler);

export default app;
