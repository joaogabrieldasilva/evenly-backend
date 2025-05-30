import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { authRoutes } from "./routes/auth.routes";
import { transactionsRoutes } from "./routes/transactions.routes";
import { accountsRoutes } from "./routes/accounts.routes";
import { creditCardsRoutes } from "./routes/credit-cards.routes";
import { aiRoutes } from "./routes/ai.routes";

export const app = new Elysia()
  .onError(({ code, error, set }) => {
    console.log(error);
    if (code === "UNKNOWN") {
      return {
        success: false,
        message: "Internal server Error",
      };
    }

    set.status = Number(code) || 400;
    return {
      success: false,
      message: "message" in error ? error?.message! : "",
    };
  })
  .use(authRoutes)
  .use(transactionsRoutes)
  .use(accountsRoutes)
  .use(creditCardsRoutes)
  .use(aiRoutes)
  .use(swagger())
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
