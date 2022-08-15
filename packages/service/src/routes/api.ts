import { expressjwt as jwt, Request } from "express-jwt";
import { Router, Response, NextFunction, json } from "express";
import config from "../../config";
import { authUserPassword } from "../middleware";
import { User } from "../models";

export const router = Router();

router.post("/login", json(), authUserPassword(), async (req, res) => {
  const { user } = res.locals;
  const token = (<User>user).generateToken();
  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
    },
  });
});

router.use(
  jwt({
    secret: config.jwt.secret,
    algorithms: ["HS256"],
  }).unless({ path: ["/login"] }),
  function (req: Request, res: Response, next: NextFunction) {
    // Do stuff here if we have a logged in user, such as:
    // if (!req.user.admin) return res.sendStatus(401);
    // res.sendStatus(200);
    next();
  },
  function (err: Error, req: Request, res: Response, next: NextFunction) {
    if (err.name === "UnauthorizedError") {
      return res.status(401).send("Invalid authorization token");
    }
  }
);
