import { desc, eq } from "drizzle-orm";
import { db } from "../database";
import { accounts } from "../database/schema";
import { CreateAccountRequestDTO } from "../dto/accounts/create-account-request.dto";

export abstract class AccountService {
  static async createAccount(
    userId: number,
    { name, balance, currency }: CreateAccountRequestDTO
  ) {
    const account = (
      await db
        .insert(accounts)
        .values({
          name,
          balance,
          currency,
          userId,
        })
        .returning({
          id: accounts.id,
        })
    )[0];

    return account;
  }

  static async getUserAccounts(userId: number) {
    const response = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.id));
    return response;
  }
}
