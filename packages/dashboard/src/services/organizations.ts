const host = import.meta.env.VITE_API_HOST;

export interface Organization {
  organizationId: string;
  role: string;
}

export class OrganizationsService {
  static listOrganizations(userId: string, token: string) {
    return fetch(`${host}/api/users/${userId}/organizations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        return response.json() as Promise<Organization[]>;
      } else {
        throw new Error("Invalid credentials");
      }
    });
  }

  static async createOrganization(userId: string, token: string, org: string) {
    const response = await fetch(`${host}/api/organizations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: org }),
    });

    if (response.status === 201) {
      return response.json();
    } else {
      throw new Error(response.statusText);
    }
  }
}
