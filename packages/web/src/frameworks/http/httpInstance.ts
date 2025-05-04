import { Cookie } from "@utility/browser";
import { httpService } from "./http";

export const http = httpService({
  baseUrl: "/api",
  requestInterceptor: (request) => {
    // Add custom headers or modify the request
    request.headers.set("X-CSRF-Token", Cookie.get("csrf_token"));
    request.headers.set("Authorization", `Bearer ${Cookie.get("auth_token")}`);
    return request;
  },

  responseInterceptor: (response) => {
    // Handle response data or errors
    if (response.status === 401) {
      // Handle unauthorized error
    }
    if (response.status === 403) {
      // Handle forbidden error
    }
    if (response.status === 404) {
      // Handle not found error
    }
    if (response.status >= 500) {
      // Handle server error
    }

    return response.json();
  },
});
