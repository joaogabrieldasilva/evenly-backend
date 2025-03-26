import { t } from "elysia";

const createTransactionRequestDTO = t.Object(
  {
    amount: t.Integer({ error: "Transaction amount must be informed" }),
    groupId: t.Number({ error: "Group id is required" }),
    borrowersIds: t.Array(t.Number(), {
      error: "Borrowers ids must be informed",
    }),
  },
  { error: "Invalid request body" }
);

type CreateTransactionRequestDTO = typeof createTransactionRequestDTO.static;

export { createTransactionRequestDTO, CreateTransactionRequestDTO };
