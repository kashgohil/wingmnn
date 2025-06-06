import { mails } from "@mails/router";
import { ResponseWrapper } from "@types";
import { Mail } from "@wingmnn/db";

mails.get("/get/:mailID", async (c) => {
  return c.json<ResponseWrapper<Mail>>({ data: {} as TSAny });
});

mails.post("/get", async (c) => {});
