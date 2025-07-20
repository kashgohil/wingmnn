import { mails } from "@mails/router";
import { Mail } from "@wingmnn/db";
import { ResponseWrapper } from "@wingmnn/types";

mails.get("/get/:mailID", async (c) => {
  return c.json<ResponseWrapper<Mail>>({ data: {} as TSAny });
});

mails.post("/get", async (c) => {});
