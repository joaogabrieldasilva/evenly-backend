import { Elysia, t } from "elysia";
import { createGroupRequestDTO } from "../dto/groups/create-group-request.dto";
import { authGuard } from "../guards/auth-guard";
import { GroupService } from "../services/group-service";
import { GroupNotFoundException } from "../exceptions/group-not-found-exception";
import { TransactionService } from "../services/transaction-service";
import { paginatedRequestParamsDTO } from "../dto/generic/paginated-request-params.dto";

export const tripGroupsRoutes = new Elysia({ prefix: "/groups" })
  .use(authGuard)
  .error("404", GroupNotFoundException)
  .post("", ({ body, userId }) => GroupService.createGroup(userId, body), {
    body: createGroupRequestDTO,
  })
  .get(
    "",
    ({ userId, query }) => {
      return GroupService.findGroupsByUserId(userId, query);
    },
    {
      query: paginatedRequestParamsDTO,
    }
  )
  .get(
    ":groupId",
    ({ params: { groupId } }) => GroupService.findGroupById(groupId),
    {
      params: t.Object({
        groupId: t.Number(),
      }),
    }
  )
  .get(
    ":groupId/members-count",
    ({ params: { groupId } }) => GroupService.getGroupMembersCount(groupId),
    {
      params: t.Object({
        groupId: t.Number(),
      }),
    }
  )
  .get(
    ":groupId/members-count",
    ({ params: { groupId } }) => GroupService.getGroupMembersCount(groupId),
    {
      params: t.Object({
        groupId: t.Number(),
      }),
    }
  )
  .get(
    ":groupId/category-count",
    ({ params: { groupId } }) => GroupService.getGroupCategoryCount(groupId),
    {
      params: t.Object({
        groupId: t.Number(),
      }),
    }
  )
  .get(
    ":groupId/category-count",
    ({ params: { groupId } }) => GroupService.getGroupCategoryCount(groupId),
    {
      params: t.Object({
        groupId: t.Number(),
      }),
    }
  )
  .get(
    ":groupId/total-spent",
    ({ params: { groupId } }) => GroupService.getGroupTotalSpent(groupId),
    {
      params: t.Object({
        groupId: t.Number(),
      }),
    }
  )
  .get(
    ":groupId/users/balance",
    ({ params: { groupId } }) =>
      GroupService.getGroupMembersWithBalance(groupId),
    {
      params: t.Object({
        groupId: t.Number(),
      }),
    }
  )
  .get(
    ":groupId/users",
    ({ params: { groupId } }) => GroupService.getGroupMembers(groupId),
    {
      params: t.Object({
        groupId: t.Number(),
      }),
    }
  );
