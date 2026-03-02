import pino from "pino";

let processHandlersRegistered = false;

function normalizeUnknown(value: unknown): Record<string, unknown> {
  if (value instanceof Error) {
    return {
      type: "Error",
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (typeof value === "string") {
    return { type: "string", message: value };
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint" ||
    typeof value === "symbol"
  ) {
    return { type: typeof value, value: String(value) };
  }

  if (value === null || value === undefined) {
    return { type: String(value) };
  }

  if (typeof value === "object") {
    try {
      return {
        type: "object",
        value: JSON.parse(JSON.stringify(value)),
      };
    } catch {
      return {
        type: "object",
        value: "[unserializable object]",
      };
    }
  }

  return { type: typeof value, value: String(value) };
}

export function registerGlobalProcessHandlers(logger: pino.Logger) {
  if (processHandlersRegistered) {
    return;
  }

  processHandlersRegistered = true;

  process.on("uncaughtException", (error) => {
    logger.error({ err: error }, "Uncaught exception intercepted");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error(
      { rejection: normalizeUnknown(reason) },
      "Unhandled promise rejection intercepted"
    );
  });

  process.on("multipleResolves", (type, _promise, reason) => {
    logger.warn(
      { type, resolution: normalizeUnknown(reason) },
      "Promise settled multiple times"
    );
  });

  process.on("warning", (warning) => {
    logger.warn({ warning: normalizeUnknown(warning) }, "Process warning");
  });
}
