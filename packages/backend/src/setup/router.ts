import { AuthenticateEnv } from "@types";
import { Hono } from "hono";

export const setup = new Hono<AuthenticateEnv>().basePath("/setup");
