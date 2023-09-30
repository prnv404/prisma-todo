import "dotenv/config";
import "express-async-errors";
import express, { Request, Response } from "express";
import cookieSession from "cookie-session";
import NotFoundError from "./lib/error/notfound.error";
import { ErrorHandler } from "./lib/middleware/error.handler.middleware";
import { AuthRouter } from "./routes/auth.route";
import { TaskRouter } from "./routes/task.route";

const app = express();

app.use(express.json());

app.use(cookieSession({ signed: false, secure: false }));

app.use("/user", AuthRouter);

app.use("/task", TaskRouter);

app.all("*", async (req: Request, res: Response) => {
	throw new NotFoundError("No route found");
});

app.use(ErrorHandler);

export default app;
