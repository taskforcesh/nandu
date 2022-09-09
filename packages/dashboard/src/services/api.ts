const host = import.meta.env.VITE_API_HOST;

import { sessionState } from "../store/state";
import { AlertsService } from "./alerts";

export class Api {
  static async base<T = any>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    options: {
      headers?: Record<string, string>;
      body?: any;
    } = {}
  ) {
    const response = await fetch(`${host}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionState().session?.token!}`,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (response.status >= 200 && response.status <= 299) {
      try {
        const json = (await response.json()) as Promise<T>;
        return json;
      } catch (e) {
        // Ignore error
      }
    } else {
      AlertsService.addAlert({
        status: "danger",
        title: "Error",
        description: response.statusText,
      });
      throw new Error(`${response.statusText}`);
    }
  }

  static get<T>(
    url: string,
    options: { headers: Record<string, string> } = { headers: {} }
  ) {
    return Api.base<T>(url, "GET", options);
  }

  static post<T>(
    url: string,
    options: {
      headers?: Record<string, string>;
      body?: any;
    }
  ) {
    return Api.base<T>(url, "POST", options);
  }

  static put<T>(
    url: string,
    options: {
      headers?: Record<string, string>;
      body?: any;
    }
  ) {
    return Api.base<T>(url, "PUT", options);
  }

  static delete<T>(
    url: string,
    options: {
      headers?: Record<string, string>;
      body?: any;
    } = {}
  ) {
    return Api.base<T>(url, "DELETE", options);
  }
}
