import { auth } from "@auth";
import { authenticate } from "@auth/middleware";
import { mails } from "@mails";
import { setup } from "@setup";
import "dotenv/config";
import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

// Global middleware
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

protectedRoutes.route("/", mails);
protectedRoutes.route("/", setup);

app.route("/", protectedRoutes);

export default app;
