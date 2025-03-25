import { treaty } from "@elysiajs/eden";
import { describe, expect, it } from "bun:test";
import { app } from "../src";

const data = [
  {
    user_id: "fhsos0cwdht7mf96h7p7ut35",
    author_id: "vob0e8r4v2ap0zgk11g5e9vp",
    debtor_name: "Bruno",
    creditor_name: "Joao",
    amount: "30000",
  },
  {
    user_id: "fhsos0cwdht7mf96h7p7ut35",
    author_id: "vob0e8r4v2ap0zgk11g5e9vp",
    debtor_name: "Bruno",
    creditor_name: "Joao",
    amount: "30000",
  },
  {
    user_id: "fhsos0cwdht7mf96h7p7ut35",
    author_id: "vob0e8r4v2ap0zgk11g5e9vp",
    debtor_name: "Bruno",
    creditor_name: "Joao",
    amount: "60000",
  },
  {
    user_id: "ndpp7vo03qmsh0tx8loz56rj",
    author_id: "srfe28bj4rvxkytrlil27djp",
    debtor_name: "Rafael",
    creditor_name: "Georg",
    amount: "10000",
  },
  {
    user_id: "s1xo8mwv89iu5w75qly6vnwf",
    author_id: "fhsos0cwdht7mf96h7p7ut35",
    debtor_name: "Natalia",
    creditor_name: "Bruno",
    amount: "30000",
  },
  {
    user_id: "srfe28bj4rvxkytrlil27djp",
    author_id: "ndpp7vo03qmsh0tx8loz56rj",
    debtor_name: "Georg",
    creditor_name: "Rafael",
    amount: "40000",
  },
] as const;

describe("Trip Groups Controller", () => {
  it("should return user's trip groups", async () => {
    const userBalance: Record<
      string,
      {
        id: string;
        name: string;
        hasToPay: Record<string, number>;
        hasToReceive: Record<string, number>;
      }
    > = {};

    data.forEach(
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

    expect(usersBalanceSummary).toEqual([
      {
        id: "fhsos0cwdht7mf96h7p7ut35",
        hasToPay: 120000,
        hasToReceive: 30000,
        name: "Bruno",
      },
      {
        id: "vob0e8r4v2ap0zgk11g5e9vp",
        hasToPay: 0,
        hasToReceive: 120000,
        name: "Joao",
      },
      {
        id: "ndpp7vo03qmsh0tx8loz56rj",
        hasToPay: 0,
        hasToReceive: 30000,
        name: "Rafael",
      },
      {
        id: "srfe28bj4rvxkytrlil27djp",
        hasToPay: 30000,
        hasToReceive: 0,
        name: "Georg",
      },
      {
        id: "s1xo8mwv89iu5w75qly6vnwf",
        hasToPay: 30000,
        hasToReceive: 0,
        name: "Natalia",
      },
    ]);
  });
});
