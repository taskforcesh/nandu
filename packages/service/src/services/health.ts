import { Request, Response } from "express";
import pino from "pino";
import { db } from "../models/db";

const logger = pino({ name: "healthcheck", level: "info" });

// Define health check response type
interface HealthCheck {
  status: "ok" | "error";
  version: string;
  timestamp: string;
  checks: {
    database: {
      status: "ok" | "error" | "pending";
      message?: string;
    };
  };
}

/**
 * Health check handler for Nandu
 * Currently checks:
 * - Database connection
 * 
 * Note: Storage checks may be added in the future if needed
 */
export async function healthCheck(req: Request, res: Response, version: string): Promise<void> {
  try {
    const health: HealthCheck = {
      status: "ok",
      version,
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: "pending" }
      }
    };

    // Check database connectivity
    try {
      await db.authenticate();
      health.checks.database = { status: "ok" };
    } catch (error) {
      health.checks.database = { 
        status: "error", 
        message: error instanceof Error ? error.message : "Failed to connect to database"
      };
      health.status = "error";
    }

    const statusCode = health.status === "ok" ? 200 : 503; // Service Unavailable if health check fails
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error({ error }, "Health check failed");
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Health check failed",
      timestamp: new Date().toISOString()
    });
  }
}
