import { Elysia, t } from "elysia";
import { createTripGroupRequestDTO } from "../dto/trip-groups/create-trip-group-request.dto";
import { authGuard } from "../guards/auth-guard";
import { TripGroupService } from "../services/trip-group-service";
import { TripGroupNotFoundException } from "../exceptions/trip-group-not-found-exception";
import { TransactionService } from "../services/transaction-service";

export const tripGroupsRoutes = new Elysia({ prefix: "/trip-groups" })
  .use(authGuard)
  .error("404", TripGroupNotFoundException)
  .post(
    "",
    ({ body, userId }) => TripGroupService.createTripGroup(userId, body),
    {
      body: createTripGroupRequestDTO,
    }
  )
  .get("", ({ userId }) => {
    return TripGroupService.findTripGroupsByUserId(userId);
  })
  .get(
    ":tripGroupId",
    ({ params: { tripGroupId } }) =>
      TripGroupService.findTripGroupById(tripGroupId),
    {
      params: t.Object({
        tripGroupId: t.String(),
      }),
    }
  )
  .get(
    ":tripGroupId/users",
    ({ params: { tripGroupId } }) =>
      TripGroupService.findTripGroupsUsers(tripGroupId),
    {
      params: t.Object({
        tripGroupId: t.String(),
      }),
    }
  )
  .get(
    ":tripGroupId/transactions-balance",
    ({ params: { tripGroupId } }) =>
      TransactionService.getGroupTransactionsBalance(tripGroupId),
    {
      params: t.Object({
        tripGroupId: t.String(),
      }),
    }
  );
