import { Elysia, t } from "elysia";
import { createTransactionRequestDTO } from "../dto/transactions/create-transaction-request.dto";
import { authGuard } from "../guards/auth-guard";
import { TransactionService } from "../services/transaction-service";
import { AccountService } from "../services/account-service";
import { createAccountRequestDTO } from "../dto/accounts/create-account-request.dto";

export const accountsRoutes = new Elysia({ prefix: "/accounts" })
  .use(authGuard)
  .post("", ({ body, userId }) => AccountService.createAccount(userId, body), {
    body: createAccountRequestDTO,
  })
  .get("", ({ userId }) => AccountService.getUserAccounts(userId));
