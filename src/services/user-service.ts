import { eq } from "drizzle-orm";
import { db } from "../database";
import { users } from "../database/schema";
import { SignUpRequestDTO } from "../dto/auth/sign-up-request.dto";

export abstract class UserService {
  static async createUser({ name, email, password }: SignUpRequestDTO) {
    const user = await db
      .insert(users)
      .values({ name, email, password })
      .returning({
        id: users.id,
        name: users.name,
        email: users.name,
      });

    return user[0];
  }

  static async findByEmail(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: {
        id: true,
        name: true,
        email: true,
      },
    });

    return user;
  }
}
