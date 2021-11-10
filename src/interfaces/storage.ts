export interface Storage {
  add(pathName: string, inputStream: NodeJS.ReadableStream): NodeJS.WritableStream;
  get(pathName: string): NodeJS.ReadableStream;
  remove(pathName: string): Promise<void>;
}
