import { Cookie } from "@utility/browser";
import { httpService } from "@wingmnn/http";
import { RouterUtils } from "@wingmnn/router";

export async function responseInterceptor(response: Response) {
  const res = await response.json();

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
    throw new Error(res.message || "Unauthorized");
  }
  if (response.status === 403) {
    throw new Error(res.message || "Forbidden");
  }
  if (response.status === 404) {
    throw new Error(res.message || "Not Found");
  }

  if (response.status === 400) {
    console.log(response, res);
    throw new Error(res.message || "Invalid Request");
  }

  if (response.status >= 500) {
    throw new Error(res.message || "Internal Server Error");
  }

  return res;
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
