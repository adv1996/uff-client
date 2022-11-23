import "isomorphic-fetch";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Platform } from "../../interfaces";
import MockServer from "../../test_utils/MockServer";
import { LeagueClient } from "./LeagueClient";

describe("League Client", () => {
  beforeAll(() => MockServer.listen());

  afterEach(() => MockServer.resetHandlers());

  afterAll(() => MockServer.close());

  it("should be able to add leagues", async () => {
    const client = new LeagueClient();
    await client.addLeague("demo", Platform.SLEEPER);
    expect(client.leagues.length).toBe(1);
  });

  it("should be able to delete leagues", async () => {
    const client = new LeagueClient();
    await client.addLeague("demo", Platform.SLEEPER);
    expect(client.leagues.length).toBe(1);
    client.removeLeague("demo");
    expect(client.leagues.length).toBe(0);
  });
});
