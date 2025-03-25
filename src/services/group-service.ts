import { eq, inArray } from "drizzle-orm";
import { db } from "../database";
import { groups, users, usersGroups } from "../database/schema";
import { CreateTripGroupRequestDTO } from "../dto/groups/create-group-request.dto";
import { GroupNotFoundException } from "../exceptions/group-not-found-exception";

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

  static async findTripGroupsByUserId(userId: string) {
    const tripGroups = await db.query.usersGroups.findMany({
      where: eq(usersGroups.userId, userId),
      columns: {},
      with: {
        tripGroup: true,
      },
    });

    return tripGroups.map((item) => item.tripGroup);
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
