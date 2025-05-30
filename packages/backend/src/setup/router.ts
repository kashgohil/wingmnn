import { AuthenticateEnv } from "@auth/middleware";
import { Hono } from "hono";

export const setup = new Hono<AuthenticateEnv>().basePath("/setup");
