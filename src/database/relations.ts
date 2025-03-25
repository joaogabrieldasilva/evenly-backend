import { relations } from "drizzle-orm";
import {
  transactions,
  tripGroups,
  users,
  usersTransactions,
  usersTripGroups,
} from "./schema";

const usersRelations = relations(users, ({ many }) => ({
  usersTripGroups: many(usersTripGroups),
}));

const tripGroupsRelations = relations(tripGroups, ({ many }) => ({
  usersTripGroups: many(usersTripGroups),
}));

const transactionsRelations = relations(transactions, ({ many }) => ({
  usersTransactions: many(usersTransactions),
}));

const usersToGroupsRelations = relations(usersTripGroups, ({ one }) => ({
  tripGroup: one(tripGroups, {
    fields: [usersTripGroups.tripGroupId],
    references: [tripGroups.id],
  }),
  user: one(users, {
    fields: [usersTripGroups.userId],
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
  //   payer: one(users, {
  //     fields: [usersTransactions.payerId],
  //     references: [users.id],
  //   }),
}));

export {
  usersRelations,
  tripGroupsRelations,
  usersToGroupsRelations,
  usersTransactionsRelations,
  transactionsRelations,
};
