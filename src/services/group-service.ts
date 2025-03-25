import { asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../database";
import { groups, transactions, users, usersGroups } from "../database/schema";
import { CreateTripGroupRequestDTO } from "../dto/groups/create-group-request.dto";
import { GroupNotFoundException } from "../exceptions/group-not-found-exception";
import { PaginatedRequestDTO } from "../dto/generic/paginated-request-params.dto";
import { withPagination } from "../utils/with-pagination";

export abstract class TripGroupService {
  static async createTripGroup(
    ownerId: string,
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

  static async findTripGroupById(tripGroupId: string) {
    const tripGroup = await db.query.groups.findFirst({
      where: eq(groups.id, tripGroupId),
    });

    if (!tripGroup) {
      throw new GroupNotFoundException();
    }
  }

  static async findTripGroupsByUserId(
    userId: string,
    { page = 1, pageSize = 10 }: PaginatedRequestDTO
  ) {
    const currentPage = (page - 1) * pageSize;

    const totalItemsSelect = (
      await db
        .select({
          totalPages: sql<number>`cast(COUNT(DISTINCT ${groups.id}) as int)`.as(
            "totalPages"
          ),
        })
        .from(usersGroups)
        .leftJoin(groups, eq(usersGroups.groupId, groups.id))
        .where(eq(usersGroups.userId, userId))
    )[0];

    const totalItems = totalItemsSelect?.totalPages || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    const userGroups = await withPagination(
      db
        .select({
          id: groups.id,
          name: groups.name,
          description: groups.description,

          totalExpenses:
            sql<number>`cast(COALESCE(SUM(${transactions.amount}), 0) as int)`.as(
              "totalExpenses"
            ),
        })
        .from(usersGroups)
        .leftJoin(groups, eq(usersGroups.groupId, groups.id))
        .leftJoin(transactions, eq(transactions.groupId, groups.id))
        .where(eq(usersGroups.userId, userId))
        .groupBy(groups.id)
        .$dynamic(),
      asc(groups.id),
      currentPage,
      pageSize
    );

    return {
      groups: userGroups,
      page,
      totalItems,
      totalPages,
    };
  }

  static async findTripGroupsUsers(tripGroupId: string) {
    const response = await db.query.usersGroups.findMany({
      where: eq(usersGroups.groupId, tripGroupId),
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
