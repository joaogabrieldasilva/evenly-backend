import {
  aliasedTable,
  and,
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
    {
      name,
      description,
      membersIds: requestMembersIds,
    }: CreateTripGroupRequestDTO
  ) {
    return db.transaction(async (transaction) => {
      const group = (
        await transaction
          .insert(groups)
          .values({
            name,
            description,
          })
          .returning()
      )[0];

      const membersIds = [ownerId, ...requestMembersIds];

      await transaction.insert(usersGroups).values(
        membersIds.map((memberId) => ({
          groupId: group.id,
          userId: memberId,
        }))
      );

      const tripGroupUsers = await db.query.users.findMany({
        where: inArray(users.id, membersIds),
        columns: {
          id: true,
          name: true,
        },
      });

      return {
        ...group,
        members: tripGroupUsers.map((user) => {
          return {
            ...user,
            isOwner: user.id === ownerId,
          };
        }),
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
          members:
            sql`array_agg(json_build_object('id', ${users.id}, 'name', ${users.name}))`.as(
              "members"
            ),
          totalExpenses:
            sql<number>`CAST(COALESCE(SUM(${transactions.amount}), 0) AS INT) / 100`.as(
              "totalExpenses"
            ),
        })
        .from(usersGroups)
        .innerJoin(groups, eq(usersGroups.groupId, groups.id))
        .leftJoin(transactions, eq(transactions.groupId, groups.id))
        .innerJoin(users, eq(users.id, usersGroups.userId))
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
        totalExpenses:
          sql<number>`CAST(COALESCE(SUM(${transactions.amount}), 0) AS INT) / 100`.as(
            "totalExpenses"
          ),
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
    const response = await db.query.usersGroups.findMany({
      where: eq(usersGroups.groupId, groupId),
      columns: {},
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    return response.map((item) => item.user);
  }
}
