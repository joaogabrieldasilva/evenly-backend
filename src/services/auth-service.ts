import { SignUpRequestDTO } from "../dto/auth/sign-up-request.dto";
import { UserService } from "./user-service";
import { SignInRequestDTO } from "../dto/auth/sign-in-request.dto";
import jwt from "jsonwebtoken";
import { UserAlreadyExistsException } from "../exceptions/user-already-exists-exception";
import { InvalidCredentialsException } from "../exceptions/invalid-credentials-exception";
import { db } from "../database";
import { eq } from "drizzle-orm";
import { users } from "../database/schema";

export class AuthService {
  async signUp({ name, email, password }: SignUpRequestDTO) {
    const user = await UserService.findByEmail(email);

    if (user) {
      throw new UserAlreadyExistsException();
    }

    const hashedPassword = Bun.password.hashSync(password, {
      algorithm: "bcrypt",
    });

    const newUser = await UserService.createUser({
      name,
      email,
      password: hashedPassword,
    });

    const { authToken, refreshToken } = this.generateTokens(newUser.id);

    return {
      auth: {
        token: authToken,
        refreshToken,
      },
    };
  }

  async signIn({ email, password }: SignInRequestDTO) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const verify = Bun.password.verifySync(password, user.password, "bcrypt");

    if (!verify) {
      throw new InvalidCredentialsException();
    }

    const { authToken, refreshToken } = this.generateTokens(user.id);

    return {
      user,
      auth: {
        token: authToken,
        refreshToken,
      },
    };
  }

  async refreshTokens({ refreshToken }: { refreshToken: string }) {
    const [, token] = refreshToken.split(" ");

    const verify = jwt.verify(token, process.env.JWT_SECRET!);

    if (!verify) {
      throw new InvalidCredentialsException();
    }

    const tokenData = jwt.decode(token);

    const userId = tokenData?.sub as string;

    if (!userId) return;

    const tokens = this.generateTokens(userId);

    return tokens;
  }

  generateTokens(userId: string) {
    const authToken = jwt.sign(
      {
        sub: userId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "4h" }
    );

    const refreshToken = jwt.sign(
      {
        sub: userId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return {
      authToken,
      refreshToken,
    };
  }
}
