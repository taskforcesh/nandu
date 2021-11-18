import { createHash } from "crypto";
import { Readable } from "stream";
import { StatusCodes } from "http-status-codes";
import { Response } from "express";

import config from "../../config";
import { Attachment } from "../interfaces";
import { Storage } from "../interfaces";
import { S3Storage, LocalStorage } from "./index";

export async function uploadAttachment(
  storage: Storage,
  versionFile: string,
  attachment: Attachment
) {
  const buffer = Buffer.from(attachment.data, "base64");
  await storage.add(versionFile, Readable.from(buffer));

  const shasum = createHash("sha1").update(buffer).digest("hex");
  const integrity = `sha512-${createHash("sha512")
    .update(buffer)
    .digest("base64")}`;
  return { shasum, integrity };
}

export async function downloadPackage(
  res: Response,
  storage: Storage,
  versionFile: string
) {
  const srcStream = await storage.get(versionFile);

  srcStream.on("error", (err) => {
    if ((err as any)["code"] == "ENOENT") {
      res.status(StatusCodes.NOT_FOUND).end("file not found");
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  });

  srcStream.pipe(res);
  res.on("error", (err) => {
    if ((err as any)["code"] == "ENOENT") {
      res.status(StatusCodes.NOT_FOUND).end("file not found");
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  });
}

export function getStorage() {
  if (config.aws.s3.bucket) {
    return new S3Storage(config.aws.s3.bucket);
  } else {
    return new LocalStorage(config.local.baseDir);
  }
}
