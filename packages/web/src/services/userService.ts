import { http } from "@frameworks/http/httpInstance";
import type { NewUser, User } from "@wingmnn/db";
import type { ResponseWrapper } from "@wingmnn/types";

export const UserService = (function () {
  function update(userID: string, updates: Partial<Omit<User, "id">>) {
    return http.put<ResponseWrapper<User>>(`/users/update/${userID}`, updates);
  }

  function del(userID: string) {
    return http.delete<ResponseWrapper<User>>(`/users/delete/${userID}`);
  }

  function create(user: NewUser) {
    return http.post<ResponseWrapper<User>>("/users/create", user);
  }

  function get(userID: string) {
    return http.get<ResponseWrapper<User>>(`/users/get/${userID}`);
  }

  function lookup(userIds: Array<string>) {
    return http.post<ResponseWrapper<Array<User>>>("/users/lookup", userIds);
  }

  return { update, delete: del, create, get, lookup };
})();
