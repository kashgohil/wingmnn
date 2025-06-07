import { AuthenticateEnv } from "@types";
import { Hono } from "hono";

export const projects = new Hono<AuthenticateEnv>().basePath("/projects");
