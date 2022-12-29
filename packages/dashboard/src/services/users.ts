import { Api } from "./api";
export interface User {
  userId?: string;
  name: string;
  email: string;
  type: string;
  password?: string;
}

export class UsersService {
  static listUsers(scope: string) {
    return Api.get<User[]>(`/api/organizations/${scope}/users`);
  }

  static createUser(user: User, scope: string, role: string = "developer") {
    return Api.put(`/-/user/org.couchdb.user:${user.name}`, {
      headers: {
        "npm-scope": scope,
        "npm-role": role,
      },
      body: user,
    });
  }

  static removeUser(userName: string, scope: string) {
    return Api.delete(`/-/org/${scope}/user`, { body: { user: userName } });
  }

  static changePassword(
    token: string,
    oldPassword: string,
    newPassword: string
  ) {
    return Api.post(`/-/npm/v1/user`, {
      body: {
        password: { old: oldPassword, new: newPassword },
      },
    });
  }

  static resetPassword(email: string) {
    return Api.post(`/api/passwords/reset`, {
      body: {
        email,
      },
    });
  }

  static setPassword(email: string, token: string, password: string) {
    return Api.post(`/api/passwords`, {
      body: {
        email,
        token,
        password,
      },
    });
  }
}
