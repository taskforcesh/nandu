const host = import.meta.env.VITE_API_HOST;

interface Package {
  name: string;
}
export class PackagesService {
  static listPackages(organizationId: string, token: string) {
    return fetch(`${host}/api/organizations/${organizationId}/packages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        return response.json() as Promise<Package[]>;
      } else {
        throw new Error("Invalid credentials");
      }
    });
  }
}
