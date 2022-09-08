import { Api } from "./api";

interface Package {
  name: string;

  // TODO: add all missing fields
}
export class PackagesService {
  static listPackages(organizationId: string) {
    return Api.get<Package[]>(`/api/organizations/${organizationId}/packages`);
  }
}
