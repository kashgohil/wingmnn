import { AuthenticateEnv } from "@types";
import { Hono } from "hono";
export const mails = new Hono<AuthenticateEnv>().basePath("/mails");
