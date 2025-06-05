import { Elysia, t } from "elysia";
import { signUpRequestDTO } from "../dto/auth/sign-up-request.dto";
import { AuthService } from "../services/auth-service";
import { signInRequestDTO } from "../dto/auth/sign-in-request.dto";
import { UserAlreadyExistsException } from "../exceptions/user-already-exists-exception";
import { UserNotFoundException } from "../exceptions/user-not-found-exception";
import { InvalidCredentialsException } from "../exceptions/invalid-credentials-exception";
import { refreshRequestDTO } from "../dto/auth/refresh-request.dto";
import { TokenExpiredError } from "jsonwebtoken";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .decorate("AuthService", new AuthService())
  .error("400", UserAlreadyExistsException)
  .error("404", UserNotFoundException)
  .error("401", InvalidCredentialsException)
  .error("401", TokenExpiredError)
  .post("/sign-up", async ({ body, AuthService }) => AuthService.signUp(body), {
    body: signUpRequestDTO,
  })
  .post("/sign-in", async ({ body, AuthService }) => AuthService.signIn(body), {
    body: signInRequestDTO,
  })
  .post(
    "/refresh",
    async ({ headers, AuthService }) =>
      AuthService.refreshTokens({ refreshToken: headers.authorization }),
    {
      headers: refreshRequestDTO,
    }
  );
