import * as path from "path";
import * as fs from "fs";
import { Readable } from "stream";

import { Storage } from "../interfaces/storage";

export class LocalStorage implements Storage {
  constructor(private dirName: string) {
    fs.mkdirSync(dirName, { recursive: true });
  }

  add(pathName: string, inputStream: Readable): Promise<void> {
    const fullPathName = path.join(this.dirName, pathName);

    fs.mkdirSync(path.dirname(fullPathName), { recursive: true });

    const outputStream = fs.createWriteStream(fullPathName, { flags: "wx" });
    inputStream.pipe(outputStream);

    return new Promise((resolve, reject) => {
      outputStream.on("finish", resolve);
      outputStream.on("error", reject);
    });
  }

  async get(pathName: string): Promise<Readable> {
    const fullPathName = path.join(this.dirName, pathName);
    return fs.createReadStream(fullPathName);
  }

  remove(pathName: string): Promise<void> {
    const fullPathName = path.join(this.dirName, pathName);
    return fs.promises.unlink(fullPathName);
  }
}
