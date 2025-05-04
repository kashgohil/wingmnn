import { Cookie } from "@utility/browser";

export const AuthService = (function () {
  // private

  // public
  function isAuthenticated() {
    return !!Cookie.get("auth_token");
  }
  return { isAuthenticated };
})();
