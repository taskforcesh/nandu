import { Api } from "./api";

export interface Organization {
  organizationId: string;
  role: string;
}

export class OrganizationsService {
  static listOrganizations(userId: string) {
    return Api.get<Organization[]>(`/api/users/${userId}/organizations`);
  }

  static async createOrganization(userId: string, org: string) {
    return Api.post(`/api/organizations`, { body: { name: org } });
  }
}
