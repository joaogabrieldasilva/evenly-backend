import { relations } from "drizzle-orm";
import {
  transactions,
  groups,
  users,
  usersTransactions,
  usersGroups,
} from "./schema";

const usersRelations = relations(users, ({ many }) => ({
  usersTripGroups: many(usersGroups),
}));

const tripGroupsRelations = relations(groups, ({ many }) => ({
  usersTripGroups: many(usersGroups),
}));

const transactionsRelations = relations(transactions, ({ many }) => ({
  usersTransactions: many(usersTransactions),
}));

const usersToGroupsRelations = relations(usersGroups, ({ one }) => ({
  tripGroup: one(groups, {
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
}));

export {
  usersRelations,
  tripGroupsRelations,
  usersToGroupsRelations,
  usersTransactionsRelations,
  transactionsRelations,
};
