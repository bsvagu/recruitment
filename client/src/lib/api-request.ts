import { queryClient } from "./queryClient";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const { method = "GET", headers = {}, body, ...rest } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...rest,
  };

  if (body) {
    config.body = body;
  }

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const apiClient = {
  get: (endpoint: string) => apiRequest(endpoint),
  post: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  }),
  patch: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: "PATCH", 
    body: JSON.stringify(data),
  }),
  put: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (endpoint: string) => apiRequest(endpoint, {
    method: "DELETE",
  }),
};