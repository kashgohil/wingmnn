import { Hono } from "hono";

export const games = new Hono().basePath("/games");
