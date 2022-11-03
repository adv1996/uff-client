import "isomorphic-fetch";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Platform } from "../../interfaces";
import MockServer from "../../test_utils/MockServer";
import { create } from "./";
import { createLeagueModel } from "./utils";

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
    const results = league.getResults([]);
    expect(results.length).toBe(12);

    const owner1Results = results[0];
    expect(owner1Results.totalPointsFor).toBe(99.08);
    expect(owner1Results.totalPointsAgainst).toBe(133.22);

    const owner2Results = results[6];
    expect(owner2Results.totalPointsFor).toBe(133.22);
    expect(owner2Results.totalPointsAgainst).toBe(99.08);
  });

  it("should generate csv correctly", async () => {
    const league = createLeagueModel("test", Platform.SLEEPER);
    // MOCK USERS, SETTINGS, MATCHUPS, PLAYERS and test
    // check if csv is generated properly
    // next up -> getResults with players data is correct -> also check for missing players
    expect(league.settings.id).toBe("test");
  });
});
