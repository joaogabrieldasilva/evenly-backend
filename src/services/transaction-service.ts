import { aliasedTable, and, eq, gt, sql } from "drizzle-orm";
import { db } from "../database";
import {
  groups,
  transactions,
  users,
  usersGroups,
  usersTransactions,
} from "../database/schema";
import { CreateTransactionRequestDTO } from "../dto/transactions/create-transaction-request.dto";
import { GroupService } from "./group-service";
import { UpdateTransactionRequestDTO } from "../dto/transactions/update-transaction-request.dto";

export abstract class TransactionService {
  static async createTransaction(
    groupId: number,
    {
      amount,
      splittedWithIds,
      category,
      description,
      createdAt,
      payerId,
    }: CreateTransactionRequestDTO
  ) {
    return db.transaction(async (trx) => {
      const amountInCents = Math.round(amount * 100);

      const transaction = (
        await trx
          .insert(transactions)
          .values({
            amount: amountInCents,
            description,
            payerId,
            groupId,
            category,
            createdAt: createdAt ? new Date(createdAt) : undefined,
          })
          .returning()
      )[0];

      const splittedWith = [payerId, ...splittedWithIds];
      const numSplitters = splittedWith.length;
      const splitAmountBase = Math.floor(amountInCents / numSplitters);
      const remainder = amountInCents - splitAmountBase * numSplitters;

      await trx.insert(usersTransactions).values(
        splittedWith.map((userId, index) => {
          const adjustedAmount =
            index < remainder ? splitAmountBase + 1 : splitAmountBase;

          return {
            userId,
            transactionId: transaction.id,
            amount: adjustedAmount,
            groupId,
          };
        })
      );

      return transaction;
    });
  }

  static async updateTransaction(
    transactionId: number,
    userId: number,
    {
      amount,
      splittedWithIds,
      category,
      description,
      createdAt,
      payerId,
    }: UpdateTransactionRequestDTO
  ) {
    return db.transaction(async (trx) => {
      // Verify transaction exists and user has permission to edit it
      const transaction = (
        await trx
          .select()
          .from(transactions)
          .where(eq(transactions.id, transactionId))
          .limit(1)
      )[0];

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      const userCanEdit =
        transaction.payerId === userId ||
        (await trx
          .select()
          .from(usersGroups)
          .where(
            and(
              eq(usersGroups.userId, userId),
              eq(usersGroups.groupId, transaction.groupId)
            )
          )
          .limit(1));

      if (!userCanEdit) {
        throw new Error("Unauthorized to edit this transaction");
      }

      const amountInCents = Math.round(amount * 100);

      await trx
        .delete(usersTransactions)
        .where(eq(usersTransactions.transactionId, transactionId));

      await trx
        .update(transactions)
        .set({
          amount: amountInCents,
          description,
          payerId,
          category,
          createdAt: createdAt ? new Date(createdAt) : transaction.createdAt,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId));

      const splittedWith = [payerId, ...splittedWithIds];

      const numSplitters = splittedWith.length;
      const splitAmountBase = Math.floor(amountInCents / numSplitters);
      const remainder = amountInCents - splitAmountBase * numSplitters;

      await trx.insert(usersTransactions).values(
        splittedWith.map((userId, index) => {
          const adjustedAmount =
            index < remainder ? splitAmountBase + 1 : splitAmountBase;

          return {
            userId,
            transactionId: transaction.id,
            amount: adjustedAmount,
            groupId: transaction.groupId,
          };
        })
      );

      return {
        id: transaction.id,
      };
    });
  }

  static async getGroupTransactions(userId: number, groupId: number) {
    const userHasAccess = await db
      .select()
      .from(usersGroups)
      .where(
        and(eq(usersGroups.userId, userId), eq(usersGroups.groupId, groupId))
      )
      .limit(1);

    if (!userHasAccess.length) {
      throw new Error("Unauthorized access to group transactions");
    }

    const result = await db.execute(sql`
      WITH transaction_data AS (
      SELECT
        t.id,
        ROUND(t.amount / 100.0, 2) AS amount,
        t.description,
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt",
        t.category,
        u.name AS "payerName",
        t.payer_id AS "payerId",
        u.profile_image AS "payerProfileImage"
      FROM transactions t
      INNER JOIN users u ON u.id = t.payer_id
      WHERE t.group_id = ${groupId}
      ),
      splitters AS (
      SELECT
        ut.transaction_id,
        json_agg(
        json_build_object(
          'id', u.id,
          'name', u.name,
          'profilePictureUrl', COALESCE(u.profile_image, '')
        )
        ) AS split_with
      FROM users_transactions ut
      INNER JOIN users u ON u.id = ut.user_id
      WHERE ut.group_id = ${groupId} AND ut.user_id != ${userId}
      GROUP BY ut.transaction_id
      )
      SELECT
      json_build_object(
        'id', td.id,
        'amount', td.amount,
        'description', COALESCE(td.description, ''),
        'createdAt', td.\"createdAt\",
        'paidBy', json_build_object(
        'id', td."payerId",
        'name', td."payerName",
        'profilePictureUrl', COALESCE(td."payerProfileImage", '')
        ),
        'splittedWith', COALESCE(s.split_with, '[]'::json),
        'category', COALESCE(td.category, 'Other')
      ) AS transaction
      FROM transaction_data td
      LEFT JOIN splitters s ON s.transaction_id = td.id
    `);

    return result.rows.map((row) => row.transaction);
  }

  static async getTransactionById(transactionId: number, userId: number) {
    const transaction = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        groupId: transactions.groupId,
      })
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!transaction.length) {
      throw new Error("Transaction not found");
    }

    const groupId = transaction[0].groupId;

    // Check if user is part of the group
    const userHasAccess = await db
      .select()
      .from(usersGroups)
      .where(
        and(eq(usersGroups.userId, userId), eq(usersGroups.groupId, groupId))
      )
      .limit(1);

    if (!userHasAccess.length) {
      throw new Error("Unauthorized access to transaction");
    }

    // Get detailed transaction data
    const result = await db.execute(sql`
      WITH transaction_data AS (
        SELECT
          t.id,
          t.amount / 100 AS amount,
          t.description,
          t.created_at AS "createdAt",
          t.updated_at AS "updatedAt",
          t.category,
          t.group_id AS "groupId",
          t.payer_id AS "payerId",
          u.name AS "payerName",
          u.profile_image AS "payerProfileImage"
        FROM transactions t
        INNER JOIN users u ON u.id = t.payer_id
        WHERE t.id = ${transactionId}
      ),
      splittedWithMembers AS (
        SELECT
          json_agg(
            json_build_object(
              'id', u.id,
              'name', u.name,
              'profilePictureUrl', COALESCE(u.profile_image, '')
            )
          ) AS splitted_with_members
        FROM users_transactions ut
        INNER JOIN users u ON u.id = ut.user_id
        WHERE ut.transaction_id = ${transactionId}
        GROUP BY ut.transaction_id
      )
      SELECT
        json_build_object(
          'id', td.id,
          'amount', td.amount,
          'description', COALESCE(td.description, ''),
          'createdAt', td."createdAt",
          'updatedAt', td."updatedAt",
          'groupId', td."groupId",
          'paidBy', json_build_object(
            'id', td."payerId",
            'name', td."payerName",
            'profilePictureUrl', COALESCE(td."payerProfileImage", '')
          ),
          'splittedWithMembers', COALESCE((SELECT splitted_with_members FROM splittedWithMembers), '[]'::json),
          'category', COALESCE(td.category, 'Other')
        ) AS transaction
      FROM transaction_data td
    `);

    if (!result.rows.length) {
      throw new Error("Transaction details not found");
    }

    return result.rows[0].transaction;
  }
}
