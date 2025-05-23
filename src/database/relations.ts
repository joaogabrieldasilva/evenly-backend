import { relations } from "drizzle-orm";
import { accounts, creditCards, transactions, users } from "./schema";

const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}));

const accountsRelations = relations(accounts, ({ one, many }) => ({
  transactions: many(transactions),
  user: one(users),
}));

const creditCardsRelations = relations(creditCards, ({ one, many }) => ({
  transactions: many(transactions),
  user: one(users),
}));

const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  creditCard: one(creditCards, {
    fields: [transactions.creditCardId],
    references: [creditCards.id],
  }),
}));

export {
  usersRelations,
  accountsRelations,
  creditCardsRelations,
  transactionsRelations,
};
