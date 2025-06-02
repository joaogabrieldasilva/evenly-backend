import { desc, eq, sql } from "drizzle-orm";
import { db } from "../database";
import { accounts, creditCards, transactions } from "../database/schema";
import { CreateCreditCardRequestDTO } from "../dto/credit-cards/create-credit-card-request.dto";

export abstract class CreditCardService {
  static async createCreditCard(
    userId: number,
    {
      name,
      creditLimit,
      currency,
      invoice,
      bank,
      color,
    }: CreateCreditCardRequestDTO
  ) {
    const creditCard = (
      await db
        .insert(creditCards)
        .values({
          name,
          creditLimit: creditLimit * 100,
          currency,
          invoice: invoice * 100,
          userId,
          bank,
          color,
        })
        .returning({
          id: creditCards.id,
        })
    )[0];

    return creditCard;
  }

  static async getUserCreditCards(userId: number) {
    const response = await db
      .select({
        id: creditCards.id,
        name: creditCards.name,
        currency: creditCards.currency,
        userId: creditCards.userId,
        bank: creditCards.bank,
        color: creditCards.color,
        invoice: sql<number>`${creditCards.invoice} / 100`,
        creditLimit: sql<number>`${creditCards.creditLimit} / 100`,
        entries: sql<number>`CAST(SUM(${transactions.amount}) AS INTEGER) / 100`,
      })
      .from(creditCards)
      .leftJoin(transactions, eq(transactions.creditCardId, creditCards.id))
      .where(eq(creditCards.userId, userId))
      .groupBy(creditCards.id)
      .orderBy(desc(creditCards.id));
    return response;
  }
}
