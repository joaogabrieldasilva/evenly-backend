import { t } from "elysia";
import { TransactionType } from "../../enums/transaction-types";

const getTransactionsRequestDTO = t.Object(
  {
    type: t.Enum(TransactionType, {
      error: "type should be either 'CREDIT_CARD' or 'ACCOUNT'",
    }),
  },
  { error: "Invalid request params" }
);

type GetTransactionsRequestDTO = typeof getTransactionsRequestDTO.static;

export { getTransactionsRequestDTO, GetTransactionsRequestDTO };
