import { Elysia } from "elysia";
import { createAccountRequestDTO } from "../dto/accounts/create-account-request.dto";
import { authGuard } from "../guards/auth-guard";
import { CreditCardService } from "../services/credit-card-service";
import { createCreditCardRequestDTO } from "../dto/credit-cards/create-credit-card-request.dto";

export const creditCardsRoutes = new Elysia({ prefix: "/credit-cards" })
  .use(authGuard)
  .post(
    "",
    ({ body, userId }) => CreditCardService.createCreditCard(userId, body),
    {
      body: createCreditCardRequestDTO,
    }
  )
  .get("", ({ userId }) => CreditCardService.getUserCreditCards(userId));
