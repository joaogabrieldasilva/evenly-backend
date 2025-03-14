import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { authMiddleware } from "./middlewares/auth-middleware";

const app = new Elysia()
  .use(authMiddleware)
  .onError(({ code, error }) => {
    if (code === "UNKNOWN") {
      return {
        success: false,
        message: "Internal server Error",
      };
    }

    return {
      success: false,
      message: "message" in error ? error?.message! : "",
    };
  })
  .use(authRoutes)
  .use(userRoutes)

  .use(swagger())
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
