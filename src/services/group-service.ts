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
    return await db.transaction(async (transaction) => {
      const group = (
        await transaction
          .insert(groups)
          .values({
            name,
            description,
            ownerId,
          })
          .returning()
      )[0];

      await transaction.insert(usersGroups).values({
        userId: ownerId,
        groupId: group.id,
      });

      console.log(group);

      return {
        groupId: group.id,
      };
    });
  }

  static async findGroupById(groupId: number) {
    const group = (
      await db
        .select({
          id: groups.id,
          name: groups.name,
          ownerId: groups.ownerId,
          createdAt: groups.createdAt,
          description: groups.description,
          members: sql`array((select ${users.profile_image} from ${usersGroups} JOIN ${users} ON ${users.id} = ${usersGroups.userId} where ${usersGroups.groupId} = ${groups.id}))`,
          totalExpenses:
            sql<number>`CAST(COALESCE(SUM(${transactions.amount}), 0) AS INT) / 100`.as(
              "totalExpenses"
            ),
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
    const userGroups = await db.execute(
      sql`
        SELECT 
          groups.id,
          groups.name,
          groups.description,
          array(
            SELECT json_build_object(
              'id', users.id,
              'name', users.name,
              'profileImage', users.profile_image
            )
            FROM users_groups
            JOIN users ON users.id = users_groups.user_id
            WHERE users_groups.group_id = groups.id
          ) AS members,
          CAST(COALESCE(SUM(transactions.amount), 0) AS INT) / 100 AS "totalExpenses"
        FROM groups
        LEFT JOIN transactions ON transactions.group_id = groups.id
        WHERE groups.id IN (
          SELECT users_groups.group_id
          FROM users_groups
          WHERE users_groups.user_id = ${userId}
        )
        ${cursor ? sql`AND groups.id > ${cursor}` : sql``}
        GROUP BY groups.id
        ORDER BY groups.id
        LIMIT ${pageSize + 1}
      `
    );

    const rows = userGroups.rows as {
      id: number;
      name: string;
      description: string;
      members: any[];
      totalExpenses: number;
    }[];

    const hasMoreItems = rows.length >= pageSize + 1;

    return {
      groups: hasMoreItems ? rows.slice(0, rows.length - 1) : rows,
      nextCursor: hasMoreItems ? rows[rows.length - 2]?.id : null,
    };
  }

  static async getGroupMembersWithBalance(groupId: number) {
    const result = await db.execute(
      sql`
        SELECT 
          users.id,
          users.name,
          users.profile_image AS "profileImage",
          ROUND((COALESCE(received.received, 0) - COALESCE(paid.paid, 0))::numeric / 100, 2) AS "balance"
        FROM users
        INNER JOIN users_groups ON users_groups.group_id = ${groupId} AND users_groups.user_id = users.id
        LEFT JOIN (
          SELECT 
            user_id,
            SUM(amount)::numeric AS paid
          FROM users_transactions
          WHERE group_id = ${groupId}
          GROUP BY user_id
        ) AS paid ON users.id = paid.user_id
        LEFT JOIN (
          SELECT 
            transactions.payer_id AS user_id,
            SUM(users_transactions.amount)::numeric AS received
          FROM users_transactions
          INNER JOIN transactions ON transactions.id = users_transactions.transaction_id
          WHERE users_transactions.group_id = ${groupId}
          GROUP BY transactions.payer_id
        ) AS received ON users.id = received.user_id
      `
    );

    return result.rows as {
      id: number;
      name: string;
      profileImage: string;
      balance: number;
    }[];
  }

  static async getGroupTotalSpent(groupId: number) {
    const groupTotalSpent = (
      await db
        .select({
          total:
            sql<number>`CAST(COALESCE(SUM(${transactions.amount}), 0) AS INT) / 100`.as(
              "total"
            ),
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

  static async getGroupMembers(groupId: number) {
    const membersResult = await db
      .select({
        id: users.id,
        name: users.name,
        profileImage: users.profile_image,
      })
      .from(groups)
      .innerJoin(usersGroups, eq(usersGroups.groupId, groups.id))
      .innerJoin(users, eq(users.id, usersGroups.userId))
      .where(eq(groups.id, groupId));

    return membersResult;
  }
}
