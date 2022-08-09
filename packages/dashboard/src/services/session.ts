import "whatwg-fetch";

type User = any;

/**
 * Class to manage a session
 *
 */
export class Session {
  private user: User;

  static login(username: string, password: string) {
    return fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }).then((response) => {
      if (response.status === 200) {
        return new Session(response.json());
      } else {
        throw new Error("Invalid credentials");
      }
    });
  }

  constructor(user: User) {
    this.user = null;
  }
}
