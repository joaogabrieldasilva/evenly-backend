import Elysia from "elysia";
import jwt from "jsonwebtoken";

export const authGuard = (app: Elysia) =>
  app
    .derive(({ headers }) => {
      const bearer = headers["authorization"];

      if (!bearer) return { userId: "" };

      const [, token] = bearer.split(" ");

      if (!token) return { userId: "" };

      const payload = jwt.verify(token, process.env.JWT_SECRET!);

      const userId = payload.sub as string;

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
