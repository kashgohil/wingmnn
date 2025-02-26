import { Cookie } from "@utility/browser";

export const AuthService = (function () {
  // priate

  // public
  function isAuthenticated() {
    return !!Cookie.get("auth_token");
  }
  return { isAuthenticated };
})();
