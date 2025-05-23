import { desc, eq } from "drizzle-orm";
import { db } from "../database";
import { accounts, creditCards } from "../database/schema";
import { CreateCreditCardRequestDTO } from "../dto/credit-cards/create-credit-card-request.dto";

export abstract class CreditCardService {
  static async createCreditCard(
    userId: number,
    { name, creditLimit, currency, invoice }: CreateCreditCardRequestDTO
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
        })
        .returning({
          id: creditCards.id,
        })
    )[0];

    return creditCard;
  }

  static async getUserCreditCards(userId: number) {
    const response = await db
      .select()
      .from(creditCards)
      .where(eq(creditCards.userId, userId))
      .orderBy(desc(creditCards.id));
    return response;
  }
}
