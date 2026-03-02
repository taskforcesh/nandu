import { describe, test, expect, mock } from "bun:test";

import { downloadPackage } from "../../../src/services/storage/util";

describe("downloadPackage", () => {
  test("returns 404 when storage throws ENOENT/NoSuchKey and does not throw", async () => {
    const storage = {
      get: mock(() => Promise.reject({ code: "ENOENT", Code: "NoSuchKey" })),
    } as any;

    const res = {
      headersSent: false,
      status: mock(() => res),
      end: mock(() => res),
      on: mock(() => res),
    } as any;

    await expect(downloadPackage(res, storage, "set-value-4.1.0.tgz")).resolves.toBeUndefined();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.end).toHaveBeenCalledWith("file not found");
  });

  test("returns 500 when storage throws unknown error and does not throw", async () => {
    const storage = {
      get: mock(() => Promise.reject(new Error("boom"))),
    } as any;

    const res = {
      headersSent: false,
      status: mock(() => res),
      end: mock(() => res),
      on: mock(() => res),
    } as any;

    await expect(downloadPackage(res, storage, "set-value-4.1.0.tgz")).resolves.toBeUndefined();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.end).toHaveBeenCalledWith("failed to download package");
  });
});
