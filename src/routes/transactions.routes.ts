import { Elysia, t } from "elysia";
import { createTransactionRequestDTO } from "../dto/transactions/create-transaction-request.dto";
import { authGuard } from "../guards/auth-guard";
import { TransactionService } from "../services/transaction-service";
import { updateTransactionRequestDTO } from "../dto/transactions/update-transaction-request.dto";

export const transactionsRoutes = new Elysia({
  prefix: "groups/:groupId/transactions",
})
  .use(authGuard)
  .post(
    "",
    ({ body, params }) =>
      TransactionService.createTransaction(params.groupId, body),
    {
      body: createTransactionRequestDTO,
      params: t.Object({
        groupId: t.Number({ error: "[groupId] must be informed" }),
      }),
    }
  )
  .put(
    ":transactionId",
    ({ body, params, userId }) =>
      TransactionService.updateTransaction(params.transactionId, userId, body),
    {
      body: updateTransactionRequestDTO,
      params: t.Object({
        groupId: t.Number({ error: "[groupId] must be informed" }),
        transactionId: t.Number({ error: "[transactionId] must be informed" }),
      }),
    }
  )
  .get(
    "",
    ({ params, userId }) =>
      TransactionService.getGroupTransactions(userId, params.groupId),
    {
      params: t.Object({
        groupId: t.Number({ error: "[groupId] must be informed" }),
      }),
    }
  )
  .get(
    ":transactionId",
    ({ params, userId }) =>
      TransactionService.getTransactionById(params.transactionId, userId),
    {
      params: t.Object({
        groupId: t.Number({ error: "[groupId] must be informed" }),
        transactionId: t.Number({ error: "[transactionId] must be informed" }),
      }),
    }
  );
