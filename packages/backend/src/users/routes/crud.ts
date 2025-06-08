import { ErrorWrapper, ResponseWrapper } from "@types";
import { users } from "@users/router";
import { userQuery } from "@users/utils";
import { eq, NewUser, User, usersTable } from "@wingmnn/db";
import { isEmpty, tryCatchAsync } from "@wingmnn/utils";

users.get("/get/:userID", async (c) => {
  const userID = c.req.param("userID");

  const { result: user, error } = await tryCatchAsync<User>(
    userQuery.get("id", userID),
  );

  if (error) {
    console.log("[USER][GET] Something went wrong: ", error);
    c.status(500);
    return c.json<ErrorWrapper>({ message: "Internal server error" });
  }

  if (isEmpty(user)) {
    console.log("[USER][GET] Could not find the user: ", userID);
    c.status(404);
    return c.json<ErrorWrapper>({ message: "Could not find the user" });
  }

  return c.json<ResponseWrapper<User>>({ data: user });
});

users.put("/update/:userID", async (c) => {
  const userID = c.req.param("userID");

  const updates: Partial<User> = await c.req.json();

  const { result: user, error } = await tryCatchAsync(
    userQuery.update
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(usersTable.id, userID))
      .returning(),
  );

  if (error) {
    console.log("[USER][UPDATE] Something went wrong: ", error);
    c.status(500);
    return c.json<ErrorWrapper>({ message: "Internal server error" });
  }

  if (isEmpty(user)) {
    console.log("[USER][UPDATE] Could not update the user: ", userID);
    c.status(500);
    return c.json<ErrorWrapper>({ message: "Could not update the user" });
  }

  return c.json<ResponseWrapper<User>>({ data: user[0] });
});

users.post("/create", async (c) => {
  const updates: NewUser = await c.req.json();

  const { result: user, error } = await tryCatchAsync(
    userQuery.insert.values(updates).returning(),
  );

  if (error) {
    console.log("[USER][CREATE] Something went wrong: ", error);
    c.status(500);
    return c.json<ErrorWrapper>({ message: "Internal server error" });
  }

  if (isEmpty(user)) {
    console.log("[USER][UPDATE] Could not create user");
    c.status(500);
    return c.json<ErrorWrapper>({ message: "Could not create the user" });
  }

  return c.json<ResponseWrapper<User>>({ data: user[0] });
});

users.delete("/delete/:userID", async (c) => {
  const userID = c.req.param("userID");

  const { result: user, error } = await tryCatchAsync(
    userQuery.update
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(usersTable.id, userID))
      .returning(),
  );

  if (error) {
    console.log("[USER][DELETE] Something went wrong: ", error);
    c.status(500);
    return c.json<ErrorWrapper>({ message: "Internal server error" });
  }

  if (isEmpty(user)) {
    console.log("[USER][DELETE] Could not delete the user: ", userID);
    c.status(500);
    return c.json<ErrorWrapper>({ message: "Could not delete the user" });
  }

  return c.json<ResponseWrapper<User>>({ data: user[0] });
});
