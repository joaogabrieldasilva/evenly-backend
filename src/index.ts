import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { authRoutes } from "./routes/auth.routes";
import { tripGroupsRoutes } from "./routes/trip-groups.routes";

export const app = new Elysia()
  .onError(({ code, error, set }) => {
    if (code === "UNKNOWN") {
      return {
        success: false,
        message: "Internal server Error",
      };
    }

    set.status = Number(code);
    return {
      success: false,
      message: "message" in error ? error?.message! : "",
    };
  })
  .use(authRoutes)
  .use(tripGroupsRoutes)
  .use(swagger())
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
