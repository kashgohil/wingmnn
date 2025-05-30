import { db } from "@db";
import { User, usersTable } from "@schema/users";
import { setup } from "@setup/router";
import { eq } from "drizzle-orm";
import { tryCatchAsync } from "utils";

setup.get("/me", async (c) => {
  const { id } = c.get("user");

  const { result: user, error } = await tryCatchAsync(
    db.query.usersTable.findFirst({ where: eq(usersTable.id, id) }),
  );

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
