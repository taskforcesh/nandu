import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction, json } from "express";
import pino from "pino";

import { authToken } from "./middleware";
import { initDb } from "./models";
import {
  loginRouter,
  packagesRouter,
  userRouter,
  tokensRouter,
  orgsRouter,
  teamsRouter,
  hooksRouter,
  apiRouter,
} from "./routes";

import { Application } from "express";
import express = require("express");
import cors = require("cors");

const pkg = require(`${getPkgJsonDir()}/package.json`);

const logger = pino();

const app = express() as Application;

app.set("trust proxy", true);

app.use(cors());

if (process.env.NODE_ENV !== "production") {
  app.use("*", (req, res, next) => {
    logger.trace({ method: req.method, path: req.path, params: req.params });
    next();
  });
}

const versionString = `Nandu NPM Registry v${pkg.version}`;

app.get("/", (req: Request, res: Response) => {
  res.status(200).send(versionString);
});

app.get("/-/ping", (req: Request, res: Response) => {
  res.status(200).send(versionString);
});

app.use(loginRouter);
app.use("/api", apiRouter);

app.use(authToken());

app.use(hooksRouter);
app.use(packagesRouter);
app.use(userRouter);
app.use(tokensRouter);
app.use(orgsRouter);
app.use(teamsRouter);

app.use("*", json(), (req: Request, res: Response, next: NextFunction) => {
  logger.info(
    {
      method: req.method,
      path: req.path,
      params: req.params,
      headers: req.headers,
      body: req.body,
    },
    "Unhandled route"
  );

  // Npm cli does not react to 501 (Not implemented) status code
  res.status(StatusCodes.NOT_FOUND).end("Not implemented");
});

// Application error logging.
app.on("error", logger.error);

export async function startServer(port: number = 4567) {
  app.listen(port, () => {
    console.log(`Nandu is running on port ${port}.`);
  });

  await initDb();
}

// Source: https://stackoverflow.com/questions/10265798/determine-project-root-from-a-running-node-js-application
function getPkgJsonDir() {
  const { dirname } = require("path");
  const { constants, accessSync } = require("fs");

  for (let path of module.paths) {
    try {
      let prospectivePkgJsonDir = dirname(path);
      accessSync(path, constants.F_OK);
      return prospectivePkgJsonDir;
    } catch (e) {}
  }
}
