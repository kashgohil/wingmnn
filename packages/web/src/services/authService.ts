import { http } from "@frameworks/http/httpInstance";
import { Cookie } from "@utility/browser";

export const AuthService = (function () {
  // private

  // public
  function isAuthenticated() {
    return Cookie.get("authenticated") === "true";
  }

  function heartbeat() {
    return http.get("/auth/heartbeat");
  }

  return { isAuthenticated, heartbeat };
})();
