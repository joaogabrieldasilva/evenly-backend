import { t } from "elysia";

const createAccountRequestDTO = t.Object(
  {
    name: t.String({ error: "[name] cannot be null" }),
    currency: t.String({
      minLength: 3,
      maxLength: 3,
      error: "[currency] cannot be null",
    }),
    balance: t.Number({ error: "[balance] cannot be null" }),
  },
  { error: "Invalid request body" }
);

type CreateAccountRequestDTO = typeof createAccountRequestDTO.static;

export { createAccountRequestDTO, CreateAccountRequestDTO };
