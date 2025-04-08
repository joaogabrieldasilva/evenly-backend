import { aliasedTable, eq, gt, sql } from "drizzle-orm";
import { db } from "../database";
import {
  groups,
  transactions,
  users,
  usersGroups,
  usersTransactions,
} from "../database/schema";
import { CreateTransactionRequestDTO } from "../dto/transactions/create-transaction-request.dto";
import { alias } from "drizzle-orm/pg-core";

export abstract class TransactionService {
  static async createTransaction(
    userId: number,
    { amount, borrowersIds, groupId }: CreateTransactionRequestDTO
  ) {
    return db.transaction(async (t) => {
      const transaction = (
        await t
          .insert(transactions)
          .values({
            amount: amount * 100,
            authorId: userId,
            groupId,
          })
          .returning()
      )[0];

      await t.insert(usersTransactions).values(
        borrowersIds.map((userId) => ({
          transactionId: transaction?.id,
          userId,
          groupId,
          amount: (amount / borrowersIds.length) * 100,
        }))
      );

      return transaction;
    });
  }

  static async getGroupTransactionsBalance(groupId: number) {
    const authors = alias(users, "authors");

    const query = await db
      .select({
        debtorId: users.id,
        debtorName: users.name,
        debtorProfileImage: users.profile_image,
        creditorId: authors.id,
        creditorName: authors.name,
        creditorProfileImage: authors.profile_image,
        transactionId: transactions.id,
        amount: usersTransactions.amount,
      })
      .from(groups)
      .innerJoin(usersTransactions, eq(usersTransactions.groupId, groups.id))
      .innerJoin(users, eq(users.id, usersTransactions.userId))
      .innerJoin(
        transactions,
        eq(transactions.id, usersTransactions.transactionId)
      )
      .innerJoin(authors, eq(authors.id, transactions.authorId))
      .where(eq(groups.id, groupId))
      .groupBy(
        users.name,
        usersTransactions.transactionId,
        usersTransactions.userId,
        usersTransactions.groupId,
        usersTransactions.groupId,
        authors.name,
        transactions.id,
        users.id,
        authors.id
      );

    const userBalance: Record<
      string,
      {
        id: number;
        name: string;
        profileImage: string;
        hasToPay: Record<string, number>;
        hasToReceive: Record<string, number>;
      }
    > = {};

    query.forEach(
      ({
        creditorName,
        debtorName,
        debtorId,
        creditorId,
        amount,
        debtorProfileImage,
        creditorProfileImage,
      }) => {
        userBalance[debtorId] = userBalance[debtorId] || {
          id: debtorId,
          hasToPay: {},
          hasToReceive: {},
          name: debtorName,
          profileImage: debtorProfileImage,
        };

        userBalance[creditorId] = userBalance[creditorId] || {
          id: creditorId,
          hasToPay: {},
          hasToReceive: {},
          name: creditorName,
          profileImage: creditorProfileImage,
        };

        userBalance[debtorId].hasToPay[creditorId] =
          (userBalance[debtorId].hasToPay[creditorId] || 0) + amount;
        userBalance[creditorId].hasToReceive[debtorId] =
          (userBalance[creditorId].hasToReceive[debtorId] || 0) + amount;
      }
    );

    console.log(userBalance);

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
        hasToPay: totalOwed / 100,
        profileImage: userBalance[person].profileImage,
        hasToReceive: totalToReceive / 100,
      };
    });

    return usersBalanceSummary;
  }

  static async getGroupHistory(userId: number, groupId: number) {
    const groupTransactions = await db
      .select({
        author: users.name,
        authorProfileImage: users.profile_image,
        amount: sql`${transactions.amount} / 100`,
        transactionId: transactions.id,
        borrowers: sql`
        array((select ${users.profile_image} from ${users} INNER JOIN ${usersTransactions} ON ${usersTransactions.userId} = ${users.id} group by ${users.id}))
        `,
      })
      .from(groups)
      .innerJoin(transactions, eq(transactions.groupId, groups.id))
      .innerJoin(users, eq(users.id, transactions.authorId))
      .where(eq(groups.id, groupId));

    return groupTransactions;
  }
}
