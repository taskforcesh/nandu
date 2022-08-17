const host = "http://localhost:4567";

export class PackagesService {
  static listPackages(organizationId: string, token: string) {
    return fetch(`${host}/-/org/${organizationId}/package`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Invalid credentials");
      }
    });
  }
}
