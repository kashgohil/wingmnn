import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { csrf } from "./middleware/csrf";

const app = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "default-secret-change-in-production",
      exp: process.env.JWT_EXPIRATION || "15m",
    })
  )
  .use(cookie())
  .use(csrf())
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
