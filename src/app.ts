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
import authRouter from "./modules/auth.route";
const app: Application = express();
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

app.use(notFoundHandler);

app.use(globalErrorHandler);

app.use("/auth", authRouter);

export default app;
