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

const tripGroups = pgTable("trip_groups", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar("name").notNull(),
  description: varchar("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const usersTripGroups = pgTable(
  "users_trip_groups",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    tripGroupId: varchar("trip_group_id")
      .notNull()
      .references(() => tripGroups.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.tripGroupId] })]
);

const transactions = pgTable("transactions", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  amount: integer("amount").notNull(),
  authorId: varchar("author_id")
    .notNull()
    .references(() => users.id),
  tripGroupId: varchar("trip_group_id")
    .notNull()
    .references(() => tripGroups.id),
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

export { users, tripGroups, usersTripGroups, transactions, usersTransactions };
