import { Api } from "./api";

export interface Token {
  key: string;
  created: string;
  readonly: string;
  token: string;
}

export class TokensService {
  static async listTokens() {
    const result = await Api.get<{ objects: Token[] }>(`/-/npm/v1/tokens`);
    return result?.objects;
  }

  static createToken(
    password: string,
    readOnly: boolean,
    cidrWhitelist: string[]
  ) {
    return Api.post(`/-/npm/v1/tokens`, {
      body: {
        password,
        readonly: readOnly,
        cidr_whitelist: cidrWhitelist,
      },
    });
  }

  static removeToken(key: string) {
    return Api.delete(`/-/npm/v1/tokens/token/${key}`, {});
  }
}
