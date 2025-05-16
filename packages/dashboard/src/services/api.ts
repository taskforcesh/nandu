// Add fallback API host value if the environment variable is not properly loaded
const host = import.meta.env.VITE_API_HOST || 'http://localhost:4567';

import { sessionState } from "../store/state";
import { AlertsService } from "./alerts";

// Define public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/api/login',
  '/api/passwords/reset',
  '/api/passwords'
];

export class Api {
  static async base<T = any>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    options: {
      headers?: Record<string, string>;
      body?: any;
    } = {}
  ) {
    
    try {
      // Check if this is a protected endpoint requiring authentication
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => url.startsWith(endpoint));
      
      if (!isPublicEndpoint && !sessionState().session?.token) {
        console.warn('Attempted API call without valid token:', url);
        throw new Error('No authentication token available');
      }
      
      const response = await fetch(`${host}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(sessionState().session?.token && { 
            Authorization: `Bearer ${sessionState().session?.token}` 
          }),
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // Handle unauthorized response by clearing session and redirecting
      if (response.status === 401) {
        console.warn('401 Unauthorized response from API');
        
        // Don't try to parse JSON for unauthorized responses
        AlertsService.addAlert({
          status: "danger",
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
        });
        
        // Return undefined for 401 responses
        return undefined;
      }

      let json;
      try {
        // Only try to parse JSON if there's content
        const text = await response.text();
        json = text ? JSON.parse(text) : null;
      } catch (e) {
        console.warn("API response is not valid JSON:", e);
        // Continue without JSON data
      }

      if (response.status >= 200 && response.status <= 299) {
        return json;
      } else {
        const errorJson = json as { message: string };
        const errorMessage = (errorJson && errorJson.message) || response.statusText;
        console.error(`API error (${response.status}): ${errorMessage}`);
        
        AlertsService.addAlert({
          status: "danger",
          title: "Error",
          description: errorMessage,
        });        
      }
    } catch (error) {
      console.error("API request failed:", error);
      AlertsService.addAlert({
        status: "danger",
        title: "Connection Error",
        description: "Failed to connect to the API. Please check if the service is running.",
      });    }
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
