import { Hono } from "hono";
export const auth = new Hono().basePath("/auth");
