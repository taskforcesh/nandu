const host = import.meta.env.VITE_API_HOST;

export interface Team {
  name: string;
  description: string;
}

export interface Package {
  organizationId: string;
  packageId: string;
  permissions: string;
  teamId: string;
}

export class TeamsService {
  static listTeams(scope: string, token: string) {
    return fetch(`${host}/api/organizations/${scope}/teams`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        return response.json() as Promise<Team[]>;
      } else {
        throw new Error("Invalid credentials");
      }
    });
  }

  static listMembers(scope: string, team: string, token: string) {
    return fetch(`${host}/api/organizations/${scope}/${team}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        return response.json() as Promise<{ name: string }[]>;
      } else {
        throw new Error("Invalid credentials");
      }
    });
  }

  static listPackages(scope: string, team: string, token: string) {
    return fetch(`${host}/-/team/${scope}/${team}/package`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        const result = await (response.json() as Promise<{
          packages: Package[];
        }>);
        return result.packages;
      } else {
        throw new Error("Invalid credentials");
      }
    });
  }

  static addTeam(
    token: string,
    team: { name: string; description: string },
    scope: string
  ) {
    return fetch(`${host}/-/org/${scope}/team`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(team),
    }).then(async (response) => {
      if (response.status !== 201) {
        throw new Error(await response.text());
      }
    });
  }

  static addMember(
    token: string,
    scope: string,
    team: string,
    userId: string,
    role: string = "developer"
  ) {
    return fetch(`${host}/-/team/${scope}/${team}/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "npm-role": role,
      },
      body: JSON.stringify({ user: userId }),
    }).then(async (response) => {
      if (response.status !== 201) {
        throw new Error(await response.text());
      }
    });
  }

  static removeTeam(token: string, team: string, scope: string) {
    return fetch(`${host}/-/team/${scope}/${team}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (response.status !== 200) {
        throw new Error(await response.text());
      }
    });
  }
}
