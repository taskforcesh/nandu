/**
 *
 */
import { StatusCodes } from "http-status-codes";
import { Request, Response, Router, json } from "express";

import { asyncWrap, authPassword, canWrite } from "../middleware";
import { isRoot } from "../utils";

import { Token } from "../models";

export const router = Router();

/**
 * Get list of tokens.
 */
router.get(
  "/-/npm/v1/tokens/:userId?",
  asyncWrap(async (req: Request, res: Response) => {
    const { _id: userId } = res.locals.user;
    const targetUserId = req.params.userId || userId;

    if (userId && userId !== targetUserId && !isRoot(res.locals.user)) {
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
  asyncWrap(async (req: Request, res: Response) => {
    const { _id: userId } = res.locals.user;
    const targetUserId = req.params.userId || userId;

    const { readonly, cidr_whitelist: cidrWhitelist } = req.body;

    if (cidrWhitelist && !Array.isArray(cidrWhitelist)) {
      res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .end("cidr-whitelist must be an array");
      return;
    }

    if (userId && userId !== targetUserId && !isRoot(res.locals.user)) {
      // Only roots can create tokens on behalf of other users
      res.status(StatusCodes.FORBIDDEN).end("Missing rights to create token");
      return;
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
  asyncWrap(async (req: Request, res: Response) => {
    const { tokenOrKey } = req.params;
    const { _id: userId } = res.locals.user;

    const hasRevoked = await Token.revokeToken(
      userId,
      tokenOrKey,
      isRoot(res.locals.user)
    );

    if (!hasRevoked) {
      res.status(StatusCodes.NOT_FOUND).end();
    } else {
      res.end();
    }
  })
);
