import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import * as relations from "./relations";

export const db = drizzle({
  logger: true,
  connection: process.env.DATABASE_URL!,
  casing: "snake_case",
  schema: {
    ...schema,
    ...relations,
  },
});
