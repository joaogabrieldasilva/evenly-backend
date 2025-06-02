import { aliasedTable, and, desc, eq, sql, sum } from "drizzle-orm";

import { db } from "../database";
import { accounts, transactions } from "../database/schema";
import { CreateAccountRequestDTO } from "../dto/accounts/create-account-request.dto";
import { TransactionEntryType } from "../enums/transaction-entry-types";

export abstract class AccountService {
  static async createAccount(
    userId: number,
    { name, balance, currency, bank, color }: CreateAccountRequestDTO
  ) {
    const account = (
      await db
        .insert(accounts)
        .values({
          name,
          balance: balance * 100,
          currency,
          userId,
          bank,
          color,
        })
        .returning({
          id: accounts.id,
        })
    )[0];

    return account;
  }

  static async getUserAccounts(userId: number) {
    const response = await db
      .select({
        id: accounts.id,
        name: accounts.name,
        currency: accounts.currency,
        balance: accounts.balance,
        bank: accounts.bank,
        color: accounts.color,
        netAmount: sql`CAST(SUM(
          CASE 
            WHEN ${transactions.entryType} = ${TransactionEntryType.DEPOSIT} THEN ${transactions.amount}
            WHEN ${transactions.entryType} = ${TransactionEntryType.EXPENSE} THEN -${transactions.amount}
            ELSE 0
          END
        ) AS INTEGER) / 100`.as("netAmount"),
      })
      .from(accounts)
      .leftJoin(transactions, eq(transactions.accountId, accounts.id))
      .where(eq(accounts.userId, userId))
      .groupBy(accounts.id)
      .orderBy(desc(accounts.id));

    return response;
  }
}
