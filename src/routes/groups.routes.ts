import { Elysia, t } from "elysia";
import { createGroupRequestDTO } from "../dto/groups/create-group-request.dto";
import { authGuard } from "../guards/auth-guard";
import { TripGroupService } from "../services/group-service";
import { GroupNotFoundException } from "../exceptions/group-not-found-exception";
import { TransactionService } from "../services/transaction-service";
import { paginatedRequestParamsDTO } from "../dto/generic/paginated-request-params.dto";

export const tripGroupsRoutes = new Elysia({ prefix: "/groups" })
  .use(authGuard)
  .error("404", GroupNotFoundException)
  .post(
    "",
    ({ body, userId }) => TripGroupService.createTripGroup(userId, body),
    {
      body: createGroupRequestDTO,
    }
  )
  .get(
    "",
    ({ userId, query }) => {
      return TripGroupService.findTripGroupsByUserId(userId, query);
    },
    {
      query: paginatedRequestParamsDTO,
    }
  )
  .get(
    ":groupId",
    ({ params: { groupId } }) => TripGroupService.findTripGroupById(groupId),
    {
      params: t.Object({
        groupId: t.Number(),
      }),
    }
  )
  .get(
    ":groupId/users",
    ({ params: { groupId } }) => TripGroupService.findTripGroupsUsers(groupId),
    {
      params: t.Object({
        groupId: t.Number(),
      }),
    }
  )
  .get(
    ":groupId/transactions-balance",
    ({ params: { groupId } }) =>
      TransactionService.getGroupTransactionsBalance(groupId),
    {
      params: t.Object({
        groupId: t.Number(),
      }),
    }
  );
