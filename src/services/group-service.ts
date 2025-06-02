import {
  aliasedTable,
  and,
  count,
  eq,
  getTableColumns,
  gt,
  inArray,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../database";
import { groups, transactions, users, usersGroups } from "../database/schema";
import { PaginatedRequestDTO } from "../dto/generic/paginated-request-params.dto";
import { CreateTripGroupRequestDTO } from "../dto/groups/create-group-request.dto";
import { GroupNotFoundException } from "../exceptions/group-not-found-exception";

export abstract class GroupService {
  static async createGroup(
    ownerId: number,
    { name, description }: CreateTripGroupRequestDTO
  ) {
    return db.transaction(async (transaction) => {
      const group = (
        await transaction
          .insert(groups)
          .values({
            name,
            description,
          })
          .returning({ id: groups.id })
      )[0];

      await transaction.insert(usersGroups).values({
        userId: ownerId,
        groupId: group.id,
      });

      return {
        groupId: group,
      };
    });
  }

  static async findGroupById(groupId: number) {
    const group = (
      await db
        .select({
          id: groups.id,
          name: groups.name,
          description: groups.description,
          members: sql`array((select ${users.profile_image} from ${usersGroups} JOIN ${users} ON ${users.id} = ${usersGroups.userId} where ${usersGroups.groupId} = ${groups.id}))`,
          totalExpenses: sql<number>`CAST(COALESCE(SUM(${transactions.amount}), 0) AS INT) / 100.as(
              "totalExpenses"
            )`,
        })
        .from(groups)
        .leftJoin(transactions, eq(transactions.groupId, groups.id))
        .orderBy(groups.id)
        .where(eq(groups.id, groupId))
        .groupBy(groups.id)
    )[0];

    if (!group) {
      throw new GroupNotFoundException();
    }

    return group;
  }

  static async findGroupsByUserId(
    userId: number,
    { cursor = 0, pageSize = 10 }: PaginatedRequestDTO
  ) {
    const userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        members: sql`array((select ${users.profile_image} from ${usersGroups} JOIN ${users} ON ${users.id} = ${usersGroups.userId} where ${usersGroups.groupId} = ${groups.id}))`,
        totalExpenses: sql`<number>CAST(COALESCE(SUM(${transactions.amount}), 0) AS INT) / 100.as(
            "totalExpenses"
          )`,
      })
      .from(groups)
      .leftJoin(transactions, eq(transactions.groupId, groups.id))
      .orderBy(groups.id)
      .limit(pageSize + 1)
      .where(
        and(
          inArray(
            groups.id,
            db
              .select({
                groupId: usersGroups.groupId,
              })
              .from(usersGroups)
              .where(eq(usersGroups.userId, userId))
          ),
          cursor ? gt(groups.id, cursor) : undefined
        )
      )
      .groupBy(groups.id);

    const hasMoreItems = userGroups.length >= pageSize + 1;

    return {
      groups: hasMoreItems
        ? userGroups.slice(0, userGroups.length - 1)
        : userGroups,
      nextCursor: hasMoreItems ? userGroups[userGroups.length - 2]?.id : null,
    };
  }

  static async findGroupsUsers(groupId: number) {
    const response = await db
      .select({
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(users)
      .innerJoin(usersGroups, eq(users.id, usersGroups.userId))
      .innerJoin(groups, eq(usersGroups.groupId, groups.id))
      .where(eq(groups.id, groupId));

    return response.map((item) => item.user);
  }

  static async getGroupTotalSpent(groupId: number) {
    const groupTotalSpent = (
      await db
        .select({
          total: sql<number>`CAST(COALESCE(SUM(${transactions.amount}), 0) AS INT) / 100.as(
              "total"
            )`,
        })
        .from(transactions)
        .where(eq(transactions.groupId, groupId))
    ).shift();

    return {
      total: groupTotalSpent?.total ?? 0,
    };
  }

  static async getGroupCategoryCount(groupId: number) {
    const groupCategoryCountResult = (
      await db
        .select({
          categoryCount: count(transactions.category).as("category"),
        })
        .from(transactions)
        .where(eq(transactions.groupId, groupId))
        .groupBy(transactions.category)
    ).shift();

    return {
      categoryCount: groupCategoryCountResult?.categoryCount ?? 0,
    };
  }

  static async getGroupMembersCount(groupId: number) {
    const membersCountResult = (
      await db
        .select({
          membersCount: count(users.id).as("membersCount"),
        })
        .from(groups)
        .innerJoin(usersGroups, eq(usersGroups.groupId, groups.id))
        .innerJoin(users, eq(users.id, usersGroups.userId))
        .where(eq(groups.id, groupId))
    ).shift();

    return {
      membersCount: membersCountResult?.membersCount ?? 0,
    };
  }
}
