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
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  password: varchar("password").notNull(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const groups = pgTable("groups", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name").notNull(),
  description: varchar("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const usersGroups = pgTable(
  "users_groups",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.groupId] })]
);

const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  amount: integer("amount").notNull(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const usersTransactions = pgTable(
  "users_transactions",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    transactionId: integer("transaction_id")
      .notNull()
      .references(() => transactions.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.transactionId] })]
);

export { users, groups, usersGroups, transactions, usersTransactions };
