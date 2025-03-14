import Elysia from "elysia";
import jwt from "jsonwebtoken";

export const authMiddleware = (app: Elysia) =>
  app
    .derive(({ headers }) => {
      const bearer = headers["authorization"];

      if (!bearer) return { user: null };

      const [, token] = bearer.split(" ");

      if (!token) return { user: null };

      const payload = jwt.verify(token, process.env.JWT_SECRET!);

      return { userId: payload?.sub };
    })
    .guard({
      beforeHandle({ set, userId, path }) {
        console.log("path", path);
        if (path.includes("/auth")) return;

        if (!userId) {
          set.status = "Unauthorized";
          return {
            success: false,
            message: "Unauthorized",
          };
        }
      },
    });
