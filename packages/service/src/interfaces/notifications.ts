import { Readable } from "stream";

export interface Notifications {
  send(pathName: string, inputStream: Readable): Promise<void>;
}
