import { Elysia, t } from "elysia";
import { createTransactionRequestDTO } from "../dto/transactions/create-transaction-request.dto";
import { authGuard } from "../guards/auth-guard";
import { TransactionService } from "../services/transaction-service";
import { aiRequestDTO } from "../dto/ai/ai-request.dto";
import { aiAgent } from "../ai/ai-agent";

export const aiRoutes = new Elysia({ prefix: "/ai" }).use(authGuard).post(
  "",
  async ({ body }) => {
    try {
      const response = await aiAgent(body.prompt);

      return {
        data: response,
      };
    } catch (error) {
      console.error(error);
      return {
        data: null,
      };
    }
  },
  {
    body: aiRequestDTO,
  }
);
