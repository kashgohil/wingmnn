import { setup } from "@setup/router";
import { User } from "@wingmnn/db";
import { ResponseWrapper } from "@wingmnn/types";
import { tryCatchAsync } from "@wingmnn/utils";
import { userQuery } from "src/users/utils";

setup.get("/me", async (c) => {
  const { id } = c.get("user");

  const { result: user, error } = await tryCatchAsync(userQuery.get("id", id));

  if (error) {
    console.error("[SETUP][ME][ERROR] something went wrong: ", error);
    return c.json<{ message: string }>(
      { message: "Something went wrong. Logging you out" },
      401,
    );
  }

  if (!user) {
    console.log("[SETUP][ME][ERROR] user not found for id: ", id);
    return c.json<{ message: string }>({ message: "User not found" }, 401);
  }

  return c.json<ResponseWrapper<User>>({ data: user });
});
