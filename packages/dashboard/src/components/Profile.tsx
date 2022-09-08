import { Component } from "solid-js";
import { useRouteData } from "@solidjs/router";

import Tokens from "./Tokens";
import ChangePassword from "./ChangePassword";
import { Token, TokensService } from "../services/tokens";

import { sessionState, state } from "../store/state";
import { UsersService } from "../services/users";
import { AlertsService } from "../services/alerts";

/**
 * Profile Component.
 *
 */
const Profile: Component = () => {
  const [tokens, setTokens] = useRouteData<any>();

  async function addToken(values: any) {
    try {
      const token = await TokensService.createToken(
        values.password,
        values.readOnly,
        []
      );
      setTokens([token, ...tokens()]);
    } catch (e) {}
  }

  async function removeToken(tokenKey: string) {
    await TokensService.removeToken(tokenKey);
    setTokens(tokens().filter((u: Token) => u.key !== tokenKey));
  }

  async function onChangePassword(values: {
    oldPassword: string;
    newPassword: string;
  }) {
    try {
      await UsersService.changePassword(
        sessionState().session?.token!,
        values.oldPassword,
        values.newPassword
      );
      AlertsService.addAlert({
        status: "success",
        title: "Password changed successfully",
      });
    } catch (e) {}
  }

  return (
    <div>
      <h1 class="text-4xl font-semibold text-white">My Profile</h1>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h1 class="text-2xl font-semibold text-white">Tokens</h1>
        <Tokens
          tokens={tokens()}
          onAddToken={addToken}
          onRemoveToken={removeToken}
        ></Tokens>

        <div class="flex flex-row justify-start mt-4">
          <ChangePassword onChangePassword={onChangePassword}> </ChangePassword>
        </div>
      </div>
    </div>
  );
};

export default Profile;
