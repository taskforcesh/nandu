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

  test("handles response stream error with headers guard and ends 500 response", async () => {
    let responseErrorHandler: ((err: unknown) => void) | undefined;

    const srcStream = {
      on: mock(() => srcStream),
      pipe: mock(() => undefined),
    } as any;

    const storage = {
      get: mock(() => Promise.resolve(srcStream)),
    } as any;

    const res = {
      headersSent: false,
      status: mock(() => res),
      end: mock(() => res),
      on: mock((event: string, handler: (err: unknown) => void) => {
        if (event === "error") {
          responseErrorHandler = handler;
        }
        return res;
      }),
    } as any;

    await downloadPackage(res, storage, "set-value-4.1.0.tgz");

    expect(responseErrorHandler).toBeDefined();
    responseErrorHandler?.(new Error("socket failure"));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.end).toHaveBeenCalledWith("failed to stream package");
  });

  test("does not write headers in response error handler when already sent", async () => {
    let responseErrorHandler: ((err: unknown) => void) | undefined;

    const srcStream = {
      on: mock(() => srcStream),
      pipe: mock(() => undefined),
    } as any;

    const storage = {
      get: mock(() => Promise.resolve(srcStream)),
    } as any;

    const res = {
      headersSent: true,
      status: mock(() => res),
      end: mock(() => res),
      on: mock((event: string, handler: (err: unknown) => void) => {
        if (event === "error") {
          responseErrorHandler = handler;
        }
        return res;
      }),
    } as any;

    await downloadPackage(res, storage, "set-value-4.1.0.tgz");

    expect(responseErrorHandler).toBeDefined();
    responseErrorHandler?.(new Error("socket failure"));

    expect(res.status).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });
});
