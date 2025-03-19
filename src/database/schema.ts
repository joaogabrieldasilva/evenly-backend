import { pgTable, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core";
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

export { users, tripGroups, usersTripGroups };
