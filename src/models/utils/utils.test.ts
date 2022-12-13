import "isomorphic-fetch";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Platform } from "../../interfaces";
import { DraftPick } from "../../interfaces/Draft.interface";
import { Transaction } from "../../interfaces/Transaction.interface";
import MockServer from "../../test_utils/MockServer";
import { create } from "./";
import { tracePlayerHistory } from "./utils";

describe("Utilities", () => {
  beforeAll(() => MockServer.listen());

  afterEach(() => MockServer.resetHandlers());

  afterAll(() => MockServer.close());

  it("should create a league from the mock server", async () => {
    const league = await create("demo", Platform.SLEEPER);
    expect(league.owners.length).toBe(12);
  });

  it("should calculate results correctly", async () => {
    const league = await create("demo", Platform.SLEEPER);
    await league.retrieveMatchups(1, 2);
    const results = league.getResults([], []);
    expect(results.length).toBe(12);

    const owner1Results = results[0];
    expect(owner1Results.totalPointsFor).toBe(99.08);
    expect(owner1Results.totalPointsAgainst).toBe(133.22);

    const owner2Results = results[6];
    expect(owner2Results.totalPointsFor).toBe(133.22);
    expect(owner2Results.totalPointsAgainst).toBe(99.08);
  });

  it.only("should trace player history from draft and transactions", () => {
    const transactions: Transaction[] = [
      {
        week: 1,
        type: "waiver",
        transactionId: "875625364733571072",
        statusUpdated: 1663139276286,
        status: "complete",
        rosterIds: [9],
        drops: {
          7045: 9,
        },
        tradedDraftPicks: [],
        adds: {
          4149: 9,
        },
        waiverBid: null,
        seq: null,
      },
      {
        week: 2,
        type: "trade",
        transactionId: "880463807347191808",
        statusUpdated: 1664291053128,
        status: "complete",
        rosterIds: [10, 1],
        drops: {
          1339: 1,
          6770: 10,
        },
        tradedDraftPicks: [],
        adds: {
          1339: 10,
          6770: 1,
        },
        waiverBid: null,
        seq: null,
      },
    ];
    const draftPicks: DraftPick[] = [
      {
        round: 1,
        rosterId: 12,
        playerId: "6813",
        pickedBy: "459443167217840128",
        pickNo: 1,
        draftSlot: 1,
      },
      {
        round: 1,
        rosterId: 12,
        playerId: "7045",
        pickedBy: "459443167217840128",
        pickNo: 2,
        draftSlot: 1,
      },
      {
        round: 1,
        rosterId: 12,
        playerId: "1339",
        pickedBy: "459443167217840128",
        pickNo: 3,
        draftSlot: 1,
      },
      {
        round: 1,
        rosterId: 12,
        playerId: "6770",
        pickedBy: "459443167217840128",
        pickNo: 4,
        draftSlot: 1,
      },
    ];
    const expectedPlayerHistory = {
      "6813": ["DRAFT"],
      "7045": ["DRAFT", "DROPPED"],
      "4149": ["ADDED"],
      "1339": ["DRAFT", "TRADE"],
      "6770": ["DRAFT", "TRADE"],
    };
    const playerHistory = tracePlayerHistory(draftPicks, transactions);
    expect(playerHistory).toStrictEqual(expectedPlayerHistory);
  });
});
