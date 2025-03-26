import Elysia from "elysia";
import jwt from "jsonwebtoken";

export const authGuard = (app: Elysia) =>
  app
    .derive(({ headers }) => {
      const bearer = headers["authorization"];

      if (!bearer) return { userId: 0 };

      const [, token] = bearer.split(" ");

      if (!token) return { userId: 0 };

      const payload = jwt.verify(token, process.env.JWT_SECRET!);

      const userId = Number(payload.sub) as number;

      return { userId };
    })
    .guard({
      beforeHandle({ set, userId }) {
        if (!userId && process.env.NODE_ENV !== "test") {
          set.status = "Unauthorized";
          return {
            success: false,
            message: "Unauthorized",
          };
        }
      },
    });
