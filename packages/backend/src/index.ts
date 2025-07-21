import { auth } from "@auth";
import { authenticate } from "@auth/middleware";
import { games } from "@games";
import { mails } from "@mails";
import { projects } from "@projects";
import { setup } from "@setup";
import { users } from "@users";
import "dotenv/config";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { timeout } from "hono/timeout";

const app = new Hono();

// Global middleware
app.use(requestId());
app.use(timeout(60 * 1000));
app.use(logger());

// Public routes
app.get("/", (c) => c.text("Howdy partner, how you doin?"));
app.get("/ping", (c) =>
  c.json<{ message: string }>({ message: "app is running" }),
);

// Auth routes
app.route("/", auth);

// Protected routes that require authentication
const protectedRoutes = new Hono().basePath("/api");
protectedRoutes.use("*", authenticate);

protectedRoutes.route("/", users);
protectedRoutes.route("/", mails);
protectedRoutes.route("/", projects);
protectedRoutes.route("/", setup);
protectedRoutes.route("/", games);

app.route("/", protectedRoutes);

export default app;
