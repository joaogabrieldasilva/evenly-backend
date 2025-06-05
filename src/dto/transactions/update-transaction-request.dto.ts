import { t } from "elysia";

const updateTransactionRequestDTO = t.Object(
  {
    amount: t.Integer({ error: "amount must be informed" }),
    payerId: t.Integer({ error: "payerId must be informed" }),
    description: t.Optional(t.String()),
    category: t.Optional(t.String()),
    createdAt: t.Optional(t.String()),
    splittedWithIds: t.Array(t.Number(), {
      error: "splittedWithIds must be informed",
    }),
  },
  { error: "Invalid request body" }
);

type UpdateTransactionRequestDTO = typeof updateTransactionRequestDTO.static;

export { updateTransactionRequestDTO, UpdateTransactionRequestDTO };
