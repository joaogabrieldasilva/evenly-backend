import { t } from "elysia";

const createCreditCardRequestDTO = t.Object(
  {
    name: t.String({ error: "[name] cannot be null" }),
    currency: t.String({
      minLength: 3,
      maxLength: 3,
      error: "[currency] cannot be null",
    }),
    invoice: t.Number({ error: "[invoice] cannot be null" }),
    creditLimit: t.Number({ error: "[creditLimit] cannot be null" }),
  },
  { error: "Invalid request body" }
);

type CreateCreditCardRequestDTO = typeof createCreditCardRequestDTO.static;

export { createCreditCardRequestDTO, CreateCreditCardRequestDTO };
