import pino from "pino";

let processHandlersRegistered = false;

export function registerGlobalProcessHandlers(logger: pino.Logger) {
  if (processHandlersRegistered) {
    return;
  }

  processHandlersRegistered = true;

  process.on("uncaughtException", (error) => {
    logger.error({ err: error }, "Uncaught exception intercepted");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection intercepted");
  });

  process.on("multipleResolves", (type, promise, reason) => {
    logger.warn(
      { type, reason, promise },
      "Promise settled multiple times"
    );
  });

  process.on("warning", (warning) => {
    logger.warn({ warning }, "Process warning");
  });
}
