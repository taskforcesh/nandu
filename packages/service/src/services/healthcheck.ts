import { Request, Response } from "express";
import { Readable } from "stream";
import { db } from "../models/db";
import { getStorage } from "../services/storage/util";

/**
 * Health check endpoint handler for Nandu
 * - Performs DB connection test
 * - Optionally tests storage connection when NANDU_HEALTH_CHECK_STORAGE=true
 * 
 * @param req Express Request object
 * @param res Express Response object
 * @param logger Pino logger instance
 * @param version Current package version
 */
export async function handleHealthCheck(
  req: Request, 
  res: Response, 
  logger: any, 
  version: string
): Promise<void> {
  try {
    // Define the health check response types
    type CheckStatus = "ok" | "error" | "pending";
    
    interface HealthCheckResult {
      status: "ok" | "error";
      version: string;
      timestamp: string;
      checks: {
        database: {
          status: CheckStatus;
          message?: string;
        };
        storage?: {
          status: CheckStatus;
          message?: string;
        };
      };
    }
    
    // Check whether to perform storage check (false by default)
    const checkStorage = process.env.NANDU_HEALTH_CHECK_STORAGE === 'true';
    
    const health: HealthCheckResult = {
      status: "ok",
      version,
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: "pending" }
      }
    };
    
    // Add storage check object if enabled
    if (checkStorage) {
      health.checks.storage = { status: "pending" };
    }

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

    // Check storage accessibility (only if enabled)
    if (checkStorage) {
      try {
        const storage = getStorage();
        
        if (storage) {
          // Create a temporary test file path
          const testFilePath = `_health_check_${Date.now()}`;
          
          try {
            // Try to write a small test file
            const testData = Readable.from(Buffer.from("health check"));
            await storage.add(testFilePath, testData);
            
            // Try to read the file to verify
            await storage.get(testFilePath);
            
            // Clean up the test file
            await storage.remove(testFilePath);
            
            health.checks.storage = { status: "ok" };
          } catch (opError) {
            // Handle operation error but still try to clean up
            try { await storage.remove(testFilePath); } catch {}
            
            throw opError;
          }
        } else {
          health.checks.storage = { 
            status: "error", 
            message: "Storage provider not initialized" 
          };
          health.status = "error";
        }
      } catch (error) {
        health.checks.storage = { 
          status: "error", 
          message: error instanceof Error ? error.message : "Failed to access storage" 
        };
        health.status = "error";
      }
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
