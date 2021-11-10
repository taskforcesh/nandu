/**
 *
 */
import { StatusCodes } from "http-status-codes";
import { Request, Response, Router, json } from "express";
import pino from "pino";

import { asyncWrap, canWrite } from "../middleware";
import { Version, Attachment } from "../interfaces";
import { LocalStorage, downloadPackage } from "../storage";
import { Package } from "../models/package";
import { Version as VersionModel } from "../models/version";
import { Team } from "../models/team";
import { isScoped, isValidPackageName } from "../utils";

const logger = pino();

import config from "../../config";

export const router = Router();

const storage = new LocalStorage(config.local.baseDir);

async function getPackageMeta(res: Response, packageId: string) {
  const pkg = await Package.getPackage(packageId);

  if (!pkg) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  res.json(pkg);
}

/**
 * Get package metadata.
 *
 */
router.get(
  "/:packageId",
  asyncWrap(async (req: Request, res: Response) => {
    const { packageId } = req.params;

    if (
      !isScoped(packageId) ||
      (await Team.checkPermissions(res.locals.user._id, packageId, [
        "read-only",
        "read-write",
      ]))
    ) {
      await getPackageMeta(res, packageId);
    } else {
      res.status(StatusCodes.FORBIDDEN).end();
    }
  })
);

/**
 * Get a scoped package metadata.
 * Note: This endpoint does not seem to be needed
 */
router.get(
  "/@:scope/:name",
  asyncWrap(async (req: Request, res: Response) => {
    const packageId = `@${req.params.scope}/${req.params.name}`;
    res.status(StatusCodes.FORBIDDEN).end();
  })
);

/**
 * Get a public package version file
 *
 * Example: https://registry.npmjs.org/uuid/-/uuid-0.0.1.tgz"
 *
 */
router.get(
  "/:package/-/:pkgFile",
  asyncWrap(async (req: Request, res: Response) => {
    downloadPackage(res, storage, req.params.pkgFile);
  })
);

/*
 * Download a binary tarball for the given version.
 * Example:  https://registry.npmjs.org/koa-bodyparser/-/koa-bodyparser-0.0.1.tgz
 */
router.get(
  "/@:scope/:package/-/@:scope2/:version",
  asyncWrap(async (req: Request, res: Response) => {
    const { scope, package: pkgName, version } = req.params;
    const packageId = `@${scope}/${pkgName}`;

    if (
      await Team.checkPermissions(res.locals.user._id, packageId, [
        "read-only",
        "read-write",
      ])
    ) {
      downloadPackage(res, storage, `@${scope}/${version}`);
    } else {
      res.status(StatusCodes.FORBIDDEN).end();
    }
  })
);

router.put(
  "/:package",
  json(),
  canWrite(),
  asyncWrap(async (req: Request, res: Response) => {
    logger.debug({ path: req.path }, "Publish");

    const {
      _id,
      name,
      versions,
      _attachments,
      access = isScoped(_id) ? "restricted" : "public",
    } = req.body as {
      _id: string;
      name: string;
      versions: Record<string, Version>;
      _attachments: Record<string, Attachment>;
      access: null | "restricted" | "public";
    };
    const { _id: userId } = res.locals.user;

    if (!isValidPackageName(name)) {
      return res.status(StatusCodes.NOT_ACCEPTABLE).end("Invalid package name");
    }

    try {
      if (!(await Team.checkPermissions(userId, _id, ["read-write"]))) {
        res.status(StatusCodes.FORBIDDEN).end();
      }

      const pkg = await Package.addPackage(_id, userId, name, access);

      const tarballPrefix = `${req.protocol}://${req.hostname}:4567/${_id}/-/`;

      const distTags = Object.entries(req.body["dist-tags"]);
      const [[tagName]] = distTags;

      await VersionModel.addVersions(
        storage,
        _id,
        versions,
        _attachments,
        tarballPrefix,
        tagName
      );

      res.status(StatusCodes.OK).end();
    } catch (err) {
      logger.error(err, "Error adding package or versions");
      if ((<any>err).code === "EEXIST") {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).end();
      } else {
        throw err;
      }
    }
  })
);

/**
 * Get all the users that have access to the given package
 */
router.get(
  "/-/package/@:scope/:name/collaborators",
  asyncWrap(async (req: Request, res: Response) => {
    res.status(StatusCodes.NOT_ACCEPTABLE).end();
  })
);

router.get(
  "/-/package/:name/collaborators",
  asyncWrap(async (req: Request, res: Response) => {
    res.status(StatusCodes.NOT_ACCEPTABLE).end();
  })
);
