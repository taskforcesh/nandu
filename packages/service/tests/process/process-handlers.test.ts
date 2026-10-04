import { describe, expect, mock, test } from "bun:test";

describe("registerGlobalProcessHandlers", () => {
  test("registers handlers once and normalizes callback payloads", async () => {
    const originalOn = process.on;
    const callbacks = new Map<string, (...args: unknown[]) => void>();
    const onMock = mock((event: string, handler: (...args: unknown[]) => void) => {
      callbacks.set(event, handler);
      return process;
    });

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

      const unhandledRejectionHandler = callbacks.get("unhandledRejection");
      const multipleResolvesHandler = callbacks.get("multipleResolves");
      const warningHandler = callbacks.get("warning");

      expect(unhandledRejectionHandler).toBeDefined();
      expect(multipleResolvesHandler).toBeDefined();
      expect(warningHandler).toBeDefined();

      const errorReason = new Error("db timeout");
      unhandledRejectionHandler?.(errorReason);

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          err: errorReason,
          rejection: expect.objectContaining({
            type: "Error",
            name: "Error",
            message: "db timeout",
          }),
        }),
        "Unhandled promise rejection intercepted"
      );

      unhandledRejectionHandler?.("network glitch");
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          rejection: expect.objectContaining({
            type: "string",
            message: "network glitch",
          }),
        }),
        "Unhandled promise rejection intercepted"
      );

      const objectReason = { code: "E_DB", retryable: true };
      unhandledRejectionHandler?.(objectReason);
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          rejection: expect.objectContaining({
            type: "object",
            value: objectReason,
          }),
        }),
        "Unhandled promise rejection intercepted"
      );

      const circularReason: Record<string, unknown> = {};
      circularReason.self = circularReason;

      expect(() => unhandledRejectionHandler?.(circularReason)).not.toThrow();
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          rejection: expect.objectContaining({
            type: "object",
            value: "[unserializable object]",
          }),
        }),
        "Unhandled promise rejection intercepted"
      );

      multipleResolvesHandler?.("resolve", Promise.resolve(), new Error("twice"));
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "resolve",
          resolution: expect.objectContaining({
            type: "Error",
            message: "twice",
          }),
        }),
        "Promise settled multiple times"
      );

      warningHandler?.(new Error("experimental warning"));
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          warning: expect.objectContaining({
            type: "Error",
            message: "experimental warning",
          }),
        }),
        "Process warning"
      );
    } finally {
      (process as any).on = originalOn;
    }
  });
});
