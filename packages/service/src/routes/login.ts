/**
 *
 */
import { StatusCodes } from "http-status-codes";
import { Request, Response, Router, json } from "express";

export const router = Router();

// Weblogin, not supported
router.post("/-/v1/login", json(), async (req: Request, res: Response) => {
  // Unsure what we are supposed to do in this endpoint
  res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ error: "You must be logged in to publish packages." });
});
