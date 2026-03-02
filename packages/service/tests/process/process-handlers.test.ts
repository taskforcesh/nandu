import { describe, expect, mock, test } from "bun:test";

describe("registerGlobalProcessHandlers", () => {
  test("registers process handlers only once", async () => {
    const originalOn = process.on;
    const onMock = mock(() => process);

    (process as any).on = onMock;

    try {
      const { registerGlobalProcessHandlers } = await import(
        "../../src/lib/process-handlers"
      );

      const logger = {
        error: mock(() => undefined),
        warn: mock(() => undefined),
      } as any;

      registerGlobalProcessHandlers(logger);
      registerGlobalProcessHandlers(logger);

      expect(onMock).toHaveBeenCalledTimes(4);
      expect(onMock).toHaveBeenCalledWith(
        "uncaughtException",
        expect.any(Function)
      );
      expect(onMock).toHaveBeenCalledWith(
        "unhandledRejection",
        expect.any(Function)
      );
      expect(onMock).toHaveBeenCalledWith(
        "multipleResolves",
        expect.any(Function)
      );
      expect(onMock).toHaveBeenCalledWith("warning", expect.any(Function));
    } finally {
      (process as any).on = originalOn;
    }
  });
});
