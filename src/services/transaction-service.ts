import { and, desc, eq, gt, sql, sum } from "drizzle-orm";
import { db } from "../database";
import { transactions } from "../database/schema";
import { subDays } from "date-fns";
import { CreateTransactionRequestDTO } from "../dto/transactions/create-transaction-request.dto";
import { TransactionType } from "../enums/transaction-types";
import { TransactionEntryType } from "../enums/transaction-entry-types";

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
                entryType: params.entryType,
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

  static async getTransactions(userId: number, type: TransactionType) {
    const accountsTransactions = await db
      .select({
        id: transactions.id,
        amount: sql<number>`(${transactions.amount}) / 100`,
        category: transactions.category,
        description: transactions.description,
        accountId: transactions.accountId,
        creditCardId: transactions.creditCardId,
        createdAt: transactions.createdAt,
        type: transactions.type,
        entryType: transactions.entryType,
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, type)))
      .orderBy(desc(transactions.id));

    return accountsTransactions;
  }

  static async getAccountWeekExpensesAndDepositsBalance(userId: number) {
    const accountsTransactions = await db
      .select({
        amount: sum(transactions.amount),
        entryType: transactions.entryType,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, TransactionType.ACCOUNT),
          gt(transactions.createdAt, subDays(new Date(), 7))
        )
      )
      .orderBy(transactions.entryType)
      .groupBy(transactions.entryType);

    console.log(accountsTransactions);

    const [depositBalance, expenseBalance] = accountsTransactions;

    return {
      expenses: {
        balance: expenseBalance ? Number(expenseBalance.amount) / 100 : 0,
      },
      entries: {
        balance: depositBalance ? Number(depositBalance.amount) / 100 : 0,
      },
    };
  }

  static async getCreditCardWeekEntries(userId: number) {
    const creditCardTransactions = await db
      .select({
        amount: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, TransactionType.CREDIT_CARD),
          gt(transactions.createdAt, subDays(new Date(), 7))
        )
      )
      .groupBy(transactions.entryType);

    const entries = creditCardTransactions[0];

    return {
      entries: entries ? Number(entries.amount) / 100 : 0,
    };
  }
}
