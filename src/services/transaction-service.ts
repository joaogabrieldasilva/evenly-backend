import { db } from "../database";
import { transactions } from "../database/schema";
import { CreateTransactionRequestDTO } from "../dto/transactions/create-transaction-request.dto";
import { TransactionType } from "../enums/transaction-types";

export abstract class TransactionService {
  static async createTransaction(
    userId: number,
    { amount, category, description, ...params }: CreateTransactionRequestDTO
  ) {
    const transaction = (
      await db
        .insert(transactions)
        .values({
          amount: amount * 100,
          userId,
          category,
          description,
          type: params.type,
          ...(params.type === TransactionType.ACCOUNT
            ? {
                accountId: params.accountId,
              }
            : {}),
          ...(params.type === TransactionType.CREDIT_CARD
            ? {
                creditCardId: params.creditCardId,
              }
            : {}),
        })
        .returning({
          id: transactions.id,
        })
    )[0];

    return transaction;
  }
}
