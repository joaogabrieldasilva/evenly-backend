import { Elysia, t } from "elysia";
import { createTransactionRequestDTO } from "../dto/transactions/create-transaction-request.dto";
import { authGuard } from "../guards/auth-guard";
import { TransactionService } from "../services/transaction-service";

export const transactionsRoutes = new Elysia({ prefix: "/transactions" })
  .use(authGuard)
  .post(
    "",
    ({ body, userId }) => TransactionService.createTransaction(userId, body),
    {
      body: createTransactionRequestDTO,
    }
  );
