const host = import.meta.env.VITE_API_HOST;

export interface User {
  userId?: string;
  name: string;
  email: string;
  type: string;
  password?: string;
}

export class UsersService {
  static listUsers(scope: string, token: string) {
    return fetch(`${host}/api/organizations/${scope}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        return response.json() as Promise<User[]>;
      } else {
        throw new Error("Invalid credentials");
      }
    });
  }

  static createUser(
    token: string,
    user: User,
    scope: string,
    role: string = "developer"
  ) {
    return fetch(`${host}/-/user/org.couchdb.user:${user.name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "npm-scope": scope,
        "npm-role": role,
      },
      body: JSON.stringify(user),
    }).then(async (response) => {
      if (response.status !== 201) {
        throw new Error(await response.text());
      }
    });
  }

  static removeUser(token: string, userName: string, scope: string) {
    return fetch(`${host}/-/org/${scope}/user`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user: userName }),
    }).then(async (response) => {
      if (response.status !== 200) {
        throw new Error(await response.text());
      }
    });
  }
}
