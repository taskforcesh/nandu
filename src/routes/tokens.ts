/**
 *
 */
import { StatusCodes } from "http-status-codes";
import { Request, Response, Router, json } from "express";

import { asyncWrap, authPassword, canWrite, isRoot } from "../middleware";
import { Token } from "../models";

export const router = Router();

/**
 * Get list of tokens.
 */
router.get(
  "/-/npm/v1/tokens/:userId?",
  isRoot(),
  asyncWrap(async (req: Request, res: Response) => {
    const { _id: userId } = res.locals.user;
    const targetUserId = req.params.userId || userId;

    if (userId && userId !== targetUserId && !res.locals.isRoot) {
      // Only roots can list other users tokens.
      res.status(StatusCodes.FORBIDDEN).end("Missing rights to list tokens");
    }

    // TODO: Implement pagination
    const result = await Token.getTokens(res.locals.user._id);
    res.json(result);
  })
);

/**
 * Create a new token
 */
router.post(
  "/-/npm/v1/tokens/:userId?",
  json(),
  canWrite(),
  authPassword(),
  isRoot(),
  asyncWrap(async (req: Request, res: Response) => {
    const { _id: userId } = res.locals.user;
    const targetUserId = req.params.userId || userId;

    const { readonly, cidr_whitelist: cidrWhitelist } = req.body;

    if (cidrWhitelist && !Array.isArray(cidrWhitelist)) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .end("cidr-whitelist must be an array");
    }

    if (userId && userId !== targetUserId && !res.locals.isRoot) {
      // Only roots can create tokens on behalf of other users
      return res
        .status(StatusCodes.FORBIDDEN)
        .end("Missing rights to create token");
    }

    const [uuid, token] = await Token.createTokenForUser(targetUserId, {
      readonly,
      cidrWhitelist,
    });

    res.status(StatusCodes.CREATED).send({
      key: token.getDataValue("key"),
      token: uuid,
      cidr_whitelist: token.getDataValue("cidrWhitelist"),
      readonly: token.getDataValue("access")?.includes("readonly"),
      created: token.getDataValue("createdAt"),
    });
  })
);

/*
 * Delete a given token
 */
router.delete(
  "/-/npm/v1/tokens/token/:tokenOrKey",
  canWrite(),
  isRoot(),
  asyncWrap(async (req: Request, res: Response) => {
    const { tokenOrKey } = req.params;
    const { _id: userId } = res.locals.user;

    const hasRevoked = await Token.revokeToken(
      userId,
      tokenOrKey,
      res.locals.isRoot
    );

    if (!hasRevoked) {
      res.status(StatusCodes.NOT_FOUND).end();
    } else {
      res.end();
    }
  })
);
