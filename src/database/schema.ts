import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

import { createId } from "@paralleldrive/cuid2";

export const users = pgTable("users", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  password: varchar("password").notNull(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
