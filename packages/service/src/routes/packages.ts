/**
 *
 */
import { StatusCodes } from "http-status-codes";
import { Request, Response, Router, json } from "express";
import pino from "pino";

import { asyncWrap, canWrite } from "../middleware";
import { Version, Attachment } from "../interfaces";
import { getStorage, downloadPackage } from "../services/storage";
import { Package } from "../models/package";
import { Version as VersionModel } from "../models/version";
import { Team } from "../models/team";
import { Organization } from "../models/organization";
import { OrganizationAction } from "../enums";

import { isScoped, isValidPackageName } from "../utils";
import config from "../../config";

const logger = pino();

const storage = getStorage();

export const router = Router();

async function getPackageMeta(res: Response, packageId: string) {
  const pkg = await Package.getPackage(packageId);

  if (!pkg) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  res.json(pkg);
}

/**
 * Get a scoped package metadata.
 *
 */
router.get(
  "/@:scope/:name",
  asyncWrap(async (req: Request, res: Response) => {
    const { type, _id } = res.locals.user;
    const packageId = `@${req.params.scope}/${req.params.name}`;
    if (
      !isScoped(packageId) ||
      type === "root" ||
      (await Team.checkPermissions(_id, packageId, ["read-only", "read-write"]))
    ) {
      await getPackageMeta(res, packageId);
    } else {
      res.status(StatusCodes.FORBIDDEN).end();
    }
  })
);

/**
 * Get package metadata.
 *
 */
router.get(
  "/:packageId",
  asyncWrap(async (req: Request, res: Response) => {
    const { packageId } = req.params;
    const { type, _id } = res.locals.user;
    if (
      type === "root" ||
      (await Team.checkPermissions(_id, packageId, ["read-only", "read-write"]))
    ) {
      await getPackageMeta(res, packageId);
    } else {
      res.status(StatusCodes.FORBIDDEN).end();
    }
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
  json({ limit: config.storage.maxPackageSize }),
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

    // URL decode the name before validation to handle cases where it gets encoded
    let decodedName: string;
    try {
      decodedName = decodeURIComponent(name);
    } catch (error) {
      // Handle malformed URI sequences
      res.status(StatusCodes.NOT_ACCEPTABLE).end("Invalid package name encoding");
      return;
    }
    
    if (!isValidPackageName(decodedName)) {
      res.status(StatusCodes.NOT_ACCEPTABLE).end("Invalid package name");
    } else {
      try {
        let canAccess = false;
        const scope = isScoped(_id) ? _id.split("/")[0].substr(1) : void 0;

        if (scope) {
          const role = await Organization.getMemberRole(scope, userId);
          if (role) {
            if (
              await Organization.checkPermissions(
                role,
                OrganizationAction.publishPackage
              )
            ) {
              canAccess = true;
            }
          }
        }

        if (
          !canAccess &&
          (await Team.checkPermissions(userId, _id, ["read-write"]))
        ) {
          canAccess = true;
        }

        if (!canAccess) {
          res.status(StatusCodes.FORBIDDEN).end();
        } else {
          const pkg = await Package.addPackage(_id, userId, name, access);

          const tarballPrefix = `${req.protocol}://${req.get(
            "host"
          )}/${_id}/-/`;

          const distTags = Object.entries(req.body["dist-tags"]);
          const [[tagName]] = distTags;

          const result = await VersionModel.addVersions(
            storage,
            _id,
            versions,
            _attachments,
            tarballPrefix,
            tagName
          );
          res.status(StatusCodes.OK).end();
        }
      } catch (err) {
        logger.error(err, "Error adding package or versions");
        if (
          (<any>err).code === "EEXIST" ||
          (<any>err).type === "UniqueConstraintError"
        ) {
          res.status(StatusCodes.UNPROCESSABLE_ENTITY).end();
        } else {
          throw err;
        }
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
