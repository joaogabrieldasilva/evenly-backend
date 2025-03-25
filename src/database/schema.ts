import {
  pgTable,
  varchar,
  timestamp,
  primaryKey,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";

const users = pgTable("users", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  password: varchar("password").notNull(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const groups = pgTable("groups", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar("name").notNull(),
  description: varchar("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const usersGroups = pgTable(
  "users_groups",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    groupId: varchar("group_id")
      .notNull()
      .references(() => groups.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.groupId] })]
);

const transactions = pgTable("transactions", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  amount: integer("amount").notNull(),
  authorId: varchar("author_id")
    .notNull()
    .references(() => users.id),
  groupId: varchar("group_id")
    .notNull()
    .references(() => groups.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const usersTransactions = pgTable(
  "users_transactions",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    transactionId: varchar("transaction_id")
      .notNull()
      .references(() => transactions.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.transactionId] })]
);

export { users, groups, usersGroups, transactions, usersTransactions };
