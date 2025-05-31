import { User } from "@db/schema/users";
import { setup } from "@setup/router";
import { userQuery } from "src/users/utils";
import { tryCatchAsync } from "utils";

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

  return c.json<{ user: User }>({ user });
});
