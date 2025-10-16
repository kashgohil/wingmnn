import { http } from "@frameworks/http/httpInstance";
import type { User } from "@wingmnn/db";
import type { ResponseWrapper } from "@wingmnn/types";

export const SetupService = (function () {
  function me() {
    return http.get<ResponseWrapper<User>>("/setup/me");
  }
  return {
    me,
  };
})();
