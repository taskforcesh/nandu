const host = import.meta.env.VITE_API_HOST;

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
  static listHooks(token: string) {
    return fetch(`${host}/-/npm/v1/hooks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        const result = await (response.json() as Promise<{ objects: Hook[] }>);
        return result.objects;
      } else {
        throw new Error("Invalid credentials");
      }
    });
  }

  static addHook(
    token: string,
    {
      type,
      name,
      endpoint,
      secret,
    }: { type: HookType; name: string; endpoint: string; secret: string }
  ) {
    if (type.type === "scope" && !name.startsWith("@")) {
      name = `@${name}`;
    }

    return fetch(`${host}/-/npm/v1/hooks/hook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, name, endpoint, secret }),
    }).then(async (response) => {
      if (response.status !== 201) {
        throw new Error(await response.text());
      }
    });
  }

  static removeHook(token: string, hookId: string, scope: string) {
    return fetch(`${host}/-/org/${scope}/user`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user: hookId }),
    }).then(async (response) => {
      if (response.status !== 200) {
        throw new Error(await response.text());
      }
    });
  }
}
