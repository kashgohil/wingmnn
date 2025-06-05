import { Cookie } from "@utility/browser";
import { httpService } from "@wingmnn/http";
import { RouterUtils } from "@wingmnn/router";

export function responseInterceptor(response: Response) {
  // Handle response data or errors
  if (response.status === 401) {
    // Handle unauthorized error
    Cookie.remove("csrf_token");
    Cookie.remove("access_token");
    Cookie.remove("refresh_token");
    Cookie.remove("authenticated");
    setTimeout(() => {
      if (window.location.pathname === "") RouterUtils.reload();
      RouterUtils.goTo("/");
    }, 2000);
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
}

export function requestInterceptor(request: Request) {
  // Add custom headers or modify the request
  request.headers.set("X-CSRF-Token", Cookie.get("csrf_token"));
  if (!request.headers.has("Content-Type")) {
    request.headers.set("Content-Type", "application/json");
  }
  return request;
}

export const http = httpService({
  baseUrl: "/api",
  requestInterceptor,
  responseInterceptor,
});
