import { eq, inArray } from "drizzle-orm";
import { db } from "../database";
import { tripGroups, users, usersTripGroups } from "../database/schema";
import { CreateTripGroupRequestDTO } from "../dto/trip-groups/create-trip-group-request.dto";
import { TripGroupNotFoundException } from "../exceptions/trip-group-not-found-exception";

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
      const tripGroup = (
        await transaction
          .insert(tripGroups)
          .values({
            name,
            description,
          })
          .returning()
      )[0];

      const membersIds = [ownerId, ...requestMembersIds];

      await transaction.insert(usersTripGroups).values(
        membersIds.map((memberId) => ({
          tripGroupId: tripGroup.id,
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
        ...tripGroup,
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
    const tripGroup = await db.query.tripGroups.findFirst({
      where: eq(tripGroups.id, tripGroupId),
    });

    if (!tripGroup) {
      throw new TripGroupNotFoundException();
    }
  }

  static async findTripGroupsByUserId(userId: string) {
    const tripGroups = await db.query.usersTripGroups.findMany({
      where: eq(usersTripGroups.userId, userId),
      columns: {},
      with: {
        tripGroup: true,
      },
    });

    return tripGroups.map((item) => item.tripGroup);
  }

  static async findTripGroupsUsers(tripGroupId: string) {
    const response = await db.query.usersTripGroups.findMany({
      where: eq(usersTripGroups.tripGroupId, tripGroupId),
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
