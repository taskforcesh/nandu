import { Api } from "./api";
export interface HookType {
  type: "owner" | "scope" | "package";
}

export interface Hook {
  id?: string;
  type: HookType;
  name: string;
  email: string;
  endpoint: string;
  last_delivery?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
}

export class HooksService {
  static async listHooks() {
    const result = await Api.get<{ objects: Hook[] }>(`/-/npm/v1/hooks`);
    return result?.objects;
  }

  static addHook({
    type,
    name,
    endpoint,
    secret,
  }: {
    type: HookType;
    name: string;
    endpoint: string;
    secret: string;
  }) {
    if (type.type === "scope" && !name.startsWith("@")) {
      name = `@${name}`;
    }

    return Api.post(`/-/npm/v1/hooks/hook`, {
      body: { type, name, endpoint, secret },
    });
  }

  static removeHook(hookId: string) {
    return Api.delete(`/-/npm/v1/hooks/hook/${hookId}`, {
      body: { user: hookId },
    });
  }
}
