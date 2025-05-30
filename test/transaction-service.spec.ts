import { describe, expect, it, mock, spyOn } from "bun:test";
import { TransactionService } from "../src/services/transaction-service";
import { makeDatabaseMock } from "./utils/make-database-mock";
import { db } from "../src/database";

const data = [
  {
    user_id: 3,
    author_id: 1,
    debtor_name: "Bruno",
    creditor_name: "Joao",
    amount: "30000",
  },
  {
    user_id: 3,
    author_id: 1,
    debtor_name: "Bruno",
    creditor_name: "Joao",
    amount: "30000",
  },
  {
    user_id: 2,
    author_id: 3,
    debtor_name: "Natalia",
    creditor_name: "Bruno",
    amount: "30000",
  },
  {
    user_id: 3,
    author_id: 1,
    debtor_name: "Bruno",
    creditor_name: "Joao",
    amount: "60000",
  },
  {
    user_id: 5,
    author_id: 4,
    debtor_name: "Rafael",
    creditor_name: "Georg",
    amount: "10000",
  },
  {
    user_id: 4,
    author_id: 5,
    debtor_name: "Georg",
    creditor_name: "Rafael",
    amount: "40000",
  },
];

describe("Transaction Service", () => {
  it("should return user's groups balance", async () => {
    mock.module("../src/database", () => ({
      db: makeDatabaseMock(),
    }));

    spyOn(db, "execute").mockResolvedValueOnce({
      rows: data,
      rowCount: data.length,
      command: "SELECT",
      oid: 1,
      fields: [],
    });

    const result = await TransactionService.getGroupTransactionsBalance(1);

    expect(result.sort()).toEqual(
      [
        {
          id: 1,
          name: "Joao",
          hasToPay: 0,
          hasToReceive: 120000,
        },
        {
          id: 2,
          name: "Natalia",
          hasToPay: 30000,
          hasToReceive: 0,
        },
        {
          id: 3,
          name: "Bruno",
          hasToPay: 120000,
          hasToReceive: 30000,
        },
        {
          id: 4,
          name: "Georg",
          hasToPay: 30000,
          hasToReceive: 0,
        },
        {
          id: 5,
          name: "Rafael",
          hasToPay: 0,
          hasToReceive: 30000,
        },
      ].sort()
    );
  });
});
