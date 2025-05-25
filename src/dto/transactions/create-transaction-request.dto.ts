import { t } from "elysia";
import { TransactionType } from "../../enums/transaction-types";
import { TransactionEntryType } from "../../enums/transaction-entry-types";

const baseTransactionFields = t.Object({
  amount: t.Integer({ error: "Transaction amount must be informed" }),
  category: t.Optional(t.String()),
  description: t.Optional(t.String()),
});

const createTransactionRequestDTO = t.Union(
  [
    t.Intersect([
      baseTransactionFields,
      t.Object({
        type: t.Literal(TransactionType.CREDIT_CARD, {
          error: "type should be either 'CREDIT_CARD' or 'ACCOUNT'",
        }),
        creditCardId: t.Integer({
          error: "[creditCardId] cannot be null if type is 'CREDIT_CARD'",
        }),
      }),
    ]),
    t.Intersect([
      baseTransactionFields,
      t.Object({
        type: t.Literal(TransactionType.ACCOUNT, {
          error: "type should be either 'CREDIT_CARD' or 'ACCOUNT'",
        }),
        entryType: t.Enum(TransactionEntryType, {
          error: "type should be either 'EXPENSE' or 'DEPOSIT'",
        }),
        accountId: t.Integer({
          error: "[accountId] cannot be null if type is 'ACCOUNT'",
        }),
      }),
    ]),
  ],
  { error: "Invalid request body" }
);

type CreateTransactionRequestDTO = typeof createTransactionRequestDTO.static;

export { createTransactionRequestDTO, CreateTransactionRequestDTO };
