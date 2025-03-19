import { relations } from "drizzle-orm";
import { tripGroups, users, usersTripGroups } from "./schema";

const usersRelations = relations(users, ({ many }) => ({
  usersTripGroups: many(usersTripGroups),
}));

const tripGroupsRelations = relations(tripGroups, ({ many }) => ({
  usersTripGroups: many(usersTripGroups),
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

export { usersRelations, tripGroupsRelations, usersToGroupsRelations };
