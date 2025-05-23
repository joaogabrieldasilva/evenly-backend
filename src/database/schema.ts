import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { TransactionType } from "../enums/transaction-types";

const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  password: varchar("password").notNull(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const accounts = pgTable("accounts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name").notNull(),
  currency: varchar("currency", { length: 3 }),
  balance: integer("balance").notNull().default(0),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
});

const creditCards = pgTable("creditCards", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name").notNull(),
  currency: varchar("currency", { length: 3 }),
  creditLimit: integer("credit_limit").notNull().default(0),
  invoice: integer("invoice").notNull().default(0),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
});

const transactionTypesEnum = pgEnum("transactionTypes", [
  TransactionType.CREDIT_CARD,
  TransactionType.ACCOUNT,
]);

const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  amount: integer("amount").notNull(),
  category: varchar("category").notNull().default("General"),
  description: varchar("description", { length: 500 }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  accountId: integer("account_id").references(() => accounts.id),
  creditCardId: integer("credit_card_id").references(() => creditCards.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at"),
  type: transactionTypesEnum("type").notNull(),
});

export { accounts, transactions, users, creditCards, transactionTypesEnum };
