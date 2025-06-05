import { Hono } from "hono";

export const mails = new Hono().basePath("/mails");

mails.get("/get?", async (c) => {});
