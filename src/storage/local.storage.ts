import * as path from "path";
import * as fs from "fs";

import { Storage } from "../interfaces/storage";

export class LocalStorage implements Storage {
  constructor(private dirName: string) {
    fs.mkdirSync(dirName, { recursive: true });
  }

  add(
    pathName: string,
    inputStream: NodeJS.ReadableStream
  ): NodeJS.WritableStream {
    const fullPathName = path.join(this.dirName, pathName);

    fs.mkdirSync(path.dirname(fullPathName), { recursive: true });

    const outputStream = fs.createWriteStream(fullPathName, { flags: "wx" });
    inputStream.pipe(outputStream);
    return outputStream;
  }

  get(pathName: string): NodeJS.ReadableStream {
    const fullPathName = path.join(this.dirName, pathName);
    return fs.createReadStream(fullPathName);
  }

  remove(pathName: string): Promise<void> {
    const fullPathName = path.join(this.dirName, pathName);
    return fs.promises.unlink(fullPathName);
  }
}
