import { httpService } from "@frameworks/http/http";
import {
  requestInterceptor,
  responseInterceptor,
} from "@frameworks/http/httpInstance";
import { Cookie } from "@utility/browser";

const http = httpService({
  baseUrl: "/auth",
  requestInterceptor,
  responseInterceptor,
});

export const AuthService = (function () {
  // private

  // public
  function isAuthenticated() {
    return Cookie.get("authenticated") === "true";
  }

  function heartbeat() {
    return http.get("/heartbeat");
  }

  return { isAuthenticated, heartbeat };
})();
