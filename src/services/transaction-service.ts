import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "../database";
import {
  transactions,
  users,
  usersTransactions,
  usersTripGroups,
} from "../database/schema";
import { CreateTransactionRequestDTO } from "../dto/transactions/create-transaction-request.dto";
import { TripGroupService } from "./trip-group-service";

export abstract class TransactionService {
  static async createTransaction(
    userId: string,
    { amount, borrowersIds, tripGroupId }: CreateTransactionRequestDTO
  ) {
    return db.transaction(async (t) => {
      const transaction = (
        await t
          .insert(transactions)
          .values({
            amount: amount * 100,
            authorId: userId,
            tripGroupId,
          })
          .returning()
      )[0];

      await t.insert(usersTransactions).values(
        borrowersIds.map((userId) => ({
          transactionId: transaction?.id,
          userId,
        }))
      );

      return transaction;
    });
  }

  static async getGroupTransactionsBalance(tripGroupId: string) {
    const query = sql`
      SELECT
        u.id AS user_id,
        u2.id AS author_id,
        u.name AS debtor_name,
        u2.name AS creditor_name,
        SUM(t.amount) / COUNT(ut.user_id) AS amount
      FROM
        users_trip_groups utg
      JOIN
        users_transactions ut ON ut.user_id = utg.user_id
      JOIN
        transactions t ON t.id = ut.transaction_id
      JOIN
        users u ON u.id = ut.user_id
      JOIN
        users u2 ON u2.id = t.author_id
      WHERE
        utg.trip_group_id = ${tripGroupId}
      GROUP BY
        ut.user_id, u.id, u2.id, u.name, u2.name, t.id
    `;

    const response = await db.execute<{
      transaction_id: string;
      user_id: string;
      author_id: string;
      debtor_name: string;
      creditor_name: string;
      amount: string;
    }>(query);

    const userBalance: Record<
      string,
      {
        id: string;
        name: string;
        hasToPay: Record<string, number>;
        hasToReceive: Record<string, number>;
      }
    > = {};

    response.rows.forEach(
      ({ creditor_name, debtor_name, user_id, author_id, amount }) => {
        const parsedAmount = parseInt(amount, 10);
        userBalance[user_id] = userBalance[user_id] || {
          id: user_id,
          hasToPay: {},
          hasToReceive: {},
          name: debtor_name,
        };
        userBalance[author_id] = userBalance[author_id] || {
          id: author_id,
          hasToPay: {},
          hasToReceive: {},
          name: creditor_name,
        };

        userBalance[user_id].hasToPay[author_id] =
          (userBalance[user_id].hasToPay[author_id] || 0) + parsedAmount;
        userBalance[author_id].hasToReceive[user_id] =
          (userBalance[author_id].hasToReceive[user_id] || 0) + parsedAmount;
      }
    );

    // get every key (user_id) from the res object
    Object.keys(userBalance).forEach((debtor, index) => {
      // get the keys (author_id) from the owes object which is inside the current debtor
      Object.keys(userBalance[debtor].hasToPay).forEach((creditor) => {
        // find what each debtor owes to a specific creditor
        const debtorOwes = userBalance[debtor].hasToPay[creditor];
        // find what each creditor owes back to a specific debitor
        const creditorOwesBack = userBalance[creditor].hasToPay[debtor] || 0;
        // calculate the balance between the two users
        const netBalance = debtorOwes - creditorOwesBack;

        if (netBalance !== 0) {
          userBalance[debtor].hasToPay[creditor] = Math.max(netBalance, 0);
          userBalance[creditor].hasToReceive[debtor] = Math.max(netBalance, 0);

          userBalance[creditor].hasToPay[debtor] = Math.max(
            creditorOwesBack - debtorOwes,
            0
          );
          userBalance[debtor].hasToReceive[creditor] = Math.max(
            creditorOwesBack - debtorOwes,
            0
          );
        }
      });
    });

    const usersBalanceSummary = Object.keys(userBalance).map((person) => {
      const totalOwed = Object.values(userBalance[person].hasToPay).reduce(
        (a, b) => a + b,
        0
      );
      const totalToReceive = Object.values(
        userBalance[person].hasToReceive
      ).reduce((a, b) => a + b, 0);
      return {
        id: userBalance[person].id,
        name: userBalance[person].name,
        hasToPay: totalOwed,
        hasToReceive: totalToReceive,
      };
    });

    return usersBalanceSummary;
  }
}
