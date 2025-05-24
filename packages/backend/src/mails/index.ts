import { db } from "@db";
import { Hono } from "hono";

export const mails = new Hono().basePath("/mails");

mails.get("/get/:id", async (c) => {
  const { id } = c.req.param();
  const mail = await db.mail.findUnique({ where: { id } });
  if (!mail) return c.notFound();
  return c.json(mail);
});

const promise =
  Math.random() > 0.5 ? Promise.resolve("something") : Promise.reject("error");
