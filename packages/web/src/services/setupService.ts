import { http } from "@frameworks/http/httpInstance";

export const SetupService = (function () {
  function me() {
    return http.get("/setup/me");
  }
  return {
    me,
  };
})();
