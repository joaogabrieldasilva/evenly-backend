import { and, eq, gt, inArray, or, sql } from "drizzle-orm";
import { db } from "../database";
import { groups, transactions, users, usersGroups } from "../database/schema";
import { PaginatedRequestDTO } from "../dto/generic/paginated-request-params.dto";
import { CreateTripGroupRequestDTO } from "../dto/groups/create-group-request.dto";
import { GroupNotFoundException } from "../exceptions/group-not-found-exception";

export abstract class TripGroupService {
  static async createTripGroup(
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

  static async findTripGroupById(groupId: number) {
    const tripGroup = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!tripGroup) {
      throw new GroupNotFoundException();
    }
  }

  static async findTripGroupsByUserId(
    userId: number,
    { cursor = 1, pageSize = 10 }: PaginatedRequestDTO
  ) {
    const userGroups = await db
      .selectDistinctOn([groups.id], {
        id: groups.id,
        name: groups.name,
        description: groups.description,
        members: users.id,
        totalExpenses:
          sql<number>`cast(COALESCE(SUM(${transactions.amount}), 0) as int)`.as(
            "totalExpenses"
          ),
      })

      .from(usersGroups)
      .leftJoin(groups, eq(usersGroups.groupId, groups.id))
      .leftJoin(transactions, eq(transactions.groupId, groups.id))
      .leftJoin(users, eq(users.id, usersGroups.userId))

      .orderBy(groups.id)
      .limit(pageSize)
      .where(
        and(
          eq(users.id, userId),
          cursor ? or(eq(groups.id, cursor), gt(groups.id, cursor)) : undefined
        )
      )
      .groupBy(groups.id, users.id);

    const hasMoreItems = userGroups.length >= pageSize + 1;

    console.log(userGroups.length, pageSize + 1);

    return {
      groups: hasMoreItems
        ? userGroups.slice(0, userGroups.length - 1)
        : userGroups,
      nextCursor: hasMoreItems ? userGroups[userGroups.length - 1]?.id : null,
    };
  }

  static async findTripGroupsUsers(groupId: number) {
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
