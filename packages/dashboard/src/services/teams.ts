import { Api } from "./api";

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
  static listTeams(scope: string) {
    return Api.get<Team[]>(`/api/organizations/${scope}/teams`);
  }

  static listMembers(scope: string, team: string) {
    return Api.get<{ name: string }[]>(
      `/api/organizations/${scope}/${team}/users`
    );
  }

  static async listPackages(scope: string, team: string) {
    const result = await Api.get<{
      packages: Package[];
    }>(`/-/team/${scope}/${team}/package`);
    return result?.packages;
  }

  static addTeam(team: { name: string; description: string }, scope: string) {
    return Api.put(`/-/org/${scope}/team`, { body: team });
  }

  static addMember(scope: string, team: string, userId: string) {
    return Api.put(`/-/team/${scope}/${team}/user`, { body: { user: userId } });
  }

  static removeMember(scope: string, team: string, userId: string) {
    return Api.delete(`/-/team/${scope}/${team}/user`, {
      body: { user: userId },
    });
  }

  static addPackage(
    scope: string,
    team: string,
    pkg: { name: string; permissions: string }
  ) {
    return Api.put(`/-/team/${scope}/${team}/package`, {
      body: { package: pkg.name, permissions: pkg.permissions },
    });
  }

  static removePackage(scope: string, team: string, pkg: string) {
    return Api.delete(`/-/team/${scope}/${team}/package`, {
      body: { package: pkg },
    });
  }

  static removeTeam(team: string, scope: string) {
    return Api.delete(`/-/team/${scope}/${team}`);
  }
}
