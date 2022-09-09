import { sign } from "jsonwebtoken";
import config from "../../../config";
import { User } from "../../models";

export const login = (user: User) => {
  // Create a JWT token.
  return sign({ name: user.name, email: user.email }, config.jwt.secret, {
    algorithm: "HS256",
  });
};
