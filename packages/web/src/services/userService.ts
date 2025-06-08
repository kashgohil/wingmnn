import { http } from "@frameworks/http/httpInstance";
import type { NewUser, User } from "@wingmnn/db";

export const UserService = (function () {
  function update(userID: string, updates: Partial<Omit<User, "id">>) {
    return http.put<User>(`/users/update/${userID}`, updates);
  }

  function del(userID: string) {
    return http.delete<User>(`/users/delete/${userID}`);
  }

  function create(user: NewUser) {
    return http.post<User>("/users/create", user);
  }

  function get(userID: string) {
    return http.get<User>(`/users/get/${userID}`);
  }

  return { update, delete: del, create, get };
})();
