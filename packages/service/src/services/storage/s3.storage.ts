import { Readable } from "stream";

import { Upload } from "@aws-sdk/lib-storage";
import {
  S3Client,
  S3,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { Storage } from "../../interfaces/storage";

const client = new S3({}) || new S3Client({});

export class S3Storage<T> implements Storage {
  constructor(private bucket: string) {}

  async add(pathName: string, inputStream: Readable): Promise<void> {
    const target = { Bucket: this.bucket, Key: pathName, Body: inputStream };

    const parallelUploads3 = new Upload({
      client,
      params: target,
    });

    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });

    await parallelUploads3.done();
  }

  async get(pathName: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: pathName,
    });

    const { Body } = await client.send(command);

    return <Readable>Body;
  }

  async remove(pathName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: pathName,
    });

    await client.send(command);
  }
}
