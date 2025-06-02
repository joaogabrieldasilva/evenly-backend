import { Elysia, t } from "elysia";
import { createTransactionRequestDTO } from "../dto/transactions/create-transaction-request.dto";
import { authGuard } from "../guards/auth-guard";
import { TransactionService } from "../services/transaction-service";
import { getTransactionsRequestDTO } from "../dto/transactions/get-transactions-request.dto";

export const transactionsRoutes = new Elysia({ prefix: "/transactions" })
  .use(authGuard)
  .post(
    "",
    ({ body, userId }) => TransactionService.createTransaction(userId, body),
    {
      body: createTransactionRequestDTO,
    }
  )
  .get(
    "",
    ({ query, userId }) =>
      TransactionService.getTransactions(userId, query.type),
    {
      query: getTransactionsRequestDTO,
    }
  )
  .get("/accounts/monthly-balance", ({ userId }) =>
    TransactionService.getAccountMonthlyExpensesAndDepositsBalance(userId)
  )
  .get("/credit-cards/monthly-entries", ({ userId }) =>
    TransactionService.getCreditCardMonthlyEntries(userId)
  );
