import "whatwg-fetch";

export type UserType = "user" | "root";
export interface User {
  _id: string;
  name: string;
  email: string;
  type: UserType;
}

const host = import.meta.env.VITE_API_HOST;

interface SessionPayload {
  user: User;
  token: string;
}

/**
 * Class to manage a session
 *
 */
export class Session {
  public user: User;
  public token: string;

  static login(username: string, password: string) {
    return fetch(`${host}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }).then(async (response) => {
      if (response.status === 200) {
        return new Session(await response.json());
      }
    });
  }

  constructor({ user, token }: { user: User; token: string }) {
    this.user = user;
    this.token = token;
  }
}
