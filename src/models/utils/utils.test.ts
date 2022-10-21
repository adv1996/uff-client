import "isomorphic-fetch";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Platform } from "../../interfaces";
import MockServer from "../../test_utils/MockServer";
import { create } from "./";

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
    const results = league.getResults();
    expect(results.ownerResults.length).toBe(12);

    const owner1Results = results.ownerResults[0];
    expect(owner1Results.pointsFor).toBe(99.08);
    expect(owner1Results.pointsAgainst).toBe(133.22);

    const owner2Results = results.ownerResults[6];
    expect(owner2Results.pointsFor).toBe(133.22);
    expect(owner2Results.pointsAgainst).toBe(99.08);
  });
});
