import { createHash } from "crypto";
import { Readable } from "stream";
import { StatusCodes } from "http-status-codes";
import { Response } from "express";

import { Attachment } from "../interfaces";
import { Storage } from "../interfaces";

export async function uploadAttachment(
  storage: Storage,
  versionFile: string,
  attachment: Attachment
) {
  const buffer = Buffer.from(attachment.data, "base64");
  await new Promise((resolve, reject) => {
    const stream = storage.add(versionFile, Readable.from(buffer));

    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  const shasum = createHash("sha1").update(buffer).digest("hex");
  const integrity = `sha512-${createHash("sha512")
    .update(buffer)
    .digest("base64")}`;
  return { shasum, integrity };
}

export function downloadPackage(
  res: Response,
  storage: Storage,
  versionFile: string
) {
  const srcStream = storage.get(versionFile);

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
