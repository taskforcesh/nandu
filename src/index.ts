import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction, json } from "express";
import pino from "pino";

import { authToken } from "./middleware";
import {
  packagesRouter,
  userRouter,
  tokensRouter,
  orgsRouter,
  teamsRouter,
} from "./routes";

const logger = pino();
const express = require("express");

const app = express();
const port = 4567;

app.set("trust proxy", true);

app.get("/-/ping", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.use(authToken());
app.use(packagesRouter);
app.use(userRouter);
app.use(tokensRouter);
app.use(orgsRouter);
app.use(teamsRouter);

app.use("*", json(), (req: Request, res: Response, next: NextFunction) => {
  logger.debug(
    "Unhandled route:",
    req.method,
    req.path,
    req.params,
    req.headers,
    req.body
  );

  // Npm cli does not react to 501 (Not implemented) status code
  res.status(StatusCodes.NOT_FOUND).end("Not implemented");
});

// Application error logging.
app.on("error", logger.error);

app.listen(port, () => {
  logger.info(`Nandu is running on port ${port}.`);
});

export default app;
