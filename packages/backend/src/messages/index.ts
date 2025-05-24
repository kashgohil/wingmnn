import { Hono } from "hono";

export const messages = new Hono().basePath("/messages");
