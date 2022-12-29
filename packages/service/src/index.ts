import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction, json, Application } from "express";
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

import express = require("express");
import cors = require("cors");

export async function startServer(
  port: number = 4567,
  dashboardOpts?: { port: number; apiHost: string }
) {
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

  if (dashboardOpts) {
    const dashboardApp = express() as Application;
    const path = require("path");
    const dashboardPath = path.resolve(
      path.join(getPkgJsonDir(), "..", "dashboard", "dist")
    );

    dashboardApp.use(express.static(dashboardPath));
    dashboardApp.get("/config", (req, res) => {
      res.json({
        version: pkg.version,
        apiHost: dashboardOpts.apiHost || `http://localhost:${port}`,
      });
    });

    dashboardApp.use("/api", apiRouter);

    dashboardApp.get("*", function (req, res) {
      res.sendFile(path.join(dashboardPath, "index.html"));
    });
    dashboardApp.listen(dashboardOpts.port, () => {
      logger.info(`Dashboard listening on port 3000`);
    });
  } else {
    app.get("/", (req: Request, res: Response) => {
      res.status(200).send(versionString);
    });
  }

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

  await initDb;

  app.listen(port, () => {
    logger.info(`Nandu is running on port ${port}.`);
  });
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
