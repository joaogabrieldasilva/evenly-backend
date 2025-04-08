import { relations } from "drizzle-orm";
import {
  transactions,
  groups,
  users,
  usersTransactions,
  usersGroups,
} from "./schema";

const usersRelations = relations(users, ({ many }) => ({
  usersGroups: many(usersGroups),
}));

const groupsRelations = relations(groups, ({ many }) => ({
  usersGroups: many(usersGroups),
  transactions: many(transactions),
}));

const transactionsRelations = relations(transactions, ({ one, many }) => ({
  usersTransactions: many(usersTransactions),
  group: one(groups, {
    fields: [transactions.groupId],
    references: [groups.id],
  }),
}));

const usersToGroupsRelations = relations(usersGroups, ({ one }) => ({
  group: one(groups, {
    fields: [usersGroups.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [usersGroups.userId],
    references: [users.id],
  }),
}));

const usersTransactionsRelations = relations(usersTransactions, ({ one }) => ({
  transaction: one(transactions, {
    fields: [usersTransactions.transactionId],
    references: [transactions.id],
  }),
  user: one(users, {
    fields: [usersTransactions.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [usersTransactions.groupId],
    references: [groups.id],
  }),
}));

export {
  usersRelations,
  groupsRelations,
  usersToGroupsRelations,
  usersTransactionsRelations,
  transactionsRelations,
};
