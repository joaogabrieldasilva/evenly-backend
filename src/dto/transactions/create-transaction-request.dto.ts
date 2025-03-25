import { t } from "elysia";

const createTransactionRequestDTO = t.Object(
  {
    amount: t.Integer({ error: "Transaction amount must be informed" }),
    tripGroupId: t.String({ error: "Trip group id" }),
    borrowersIds: t.Array(t.String(), {
      error: "Borrowers ids must be informed",
    }),
  },
  { error: "Invalid request body" }
);

type CreateTransactionRequestDTO = typeof createTransactionRequestDTO.static;

export { createTransactionRequestDTO, CreateTransactionRequestDTO };
