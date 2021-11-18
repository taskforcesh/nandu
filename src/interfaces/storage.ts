import { Readable } from "stream";

export interface Storage {
  add(pathName: string, inputStream: Readable): Promise<void>;
  get(pathName: string): Promise<Readable>;
  remove(pathName: string): Promise<void>;
}
