import { Matchup, Owner, Platform, User } from "@/interfaces";
import { describe, expect, it } from "vitest";
import { columns, MISSING } from "../utils/constants";
import { createLeagueModel } from "../utils/utils";

describe("League Model", () => {
  const players = [
    {
      id: "P1",
      firstName: "Pete",
      lastName: "D",
      positions: [],
      team: "SNL",
    },
    {
      id: "P2",
      firstName: "Barrack",
      lastName: "O",
      positions: [],
      team: "POTUS",
    },
    {
      id: "P3",
      firstName: "Lebron",
      lastName: "J",
      positions: [],
      team: "LA",
    },
    {
      id: "P4",
      firstName: "Rick",
      lastName: "S",
      positions: [],
      team: "RM",
    },
  ];
  const users: User[] = [
    {
      userId: "001",
      displayName: "UserA",
      teamName: "TeamA",
      avatar: "https://AvatarA",
    },
    {
      userId: "002",
      displayName: "UserB",
      teamName: "TeamB",
      avatar: "https://AvatarB",
    },
  ];
  const owners: Owner[] = [
    { rosterId: 1, ownerId: "001" },
    { rosterId: 2, ownerId: "002" },
  ];
  const matchups: Matchup[] = [
    {
      week: 1,
      startersPoints: [10],
      starters: ["P1"],
      rosterId: 1,
      points: 10,
      playersPoints: {
        P1: 10,
        P2: 10,
      },
      players: ["P1", "P2"],
      matchupId: 1,
    },
    {
      week: 1,
      startersPoints: [15],
      starters: ["P3"],
      rosterId: 2,
      points: 15,
      playersPoints: {
        P3: 15,
        P4: 4,
      },
      players: ["P3", "P4"],
      matchupId: 1,
    },
  ];

  const setupLeague = () => {
    const league = createLeagueModel("test", Platform.SLEEPER);
    league.users = users;
    league.owners = owners;
    league.matchups = [matchups];
    return league;
  };
  it("should generate csv with league headers if no data", () => {
    const league = createLeagueModel("test", Platform.SLEEPER);
    // Special Characters - %2C - comma, %0A - new line
    expect(league.getResultsCSV([])).toBe(columns.join("%2C") + "%0A");
  });
  it("should generate csv data correctly", () => {
    const league = setupLeague();
    expect(league.getResultsCSV([])).toBe(
      "displayName%2CteamName%2CuserId%2CmatchupId%2Cweek%2CpointsFor%2CpointsAgainst%2Coutcome%2Croster%0AUserA%2CTeamA%2C001%2C1%2C1%2C10%2C15%2CLOSS%0AUserB%2CTeamB%2C002%2C1%2C1%2C15%2C10%2CWIN"
    );
  });
  it("should generate roster information with missing values when players metadata not injected", () => {
    const league = setupLeague();
    const results = league.getResults([]);
    const week1Team1Results = results[0].weeklyResults[0].roster;
    expect(week1Team1Results.map((roster) => roster.firstName)).toStrictEqual([
      MISSING.FIRST_NAME,
      MISSING.FIRST_NAME,
    ]);
    expect(week1Team1Results.map((roster) => roster.lastName)).toStrictEqual([
      MISSING.LAST_NAME,
      MISSING.LAST_NAME,
    ]);
    expect(week1Team1Results.map((roster) => roster.team)).toStrictEqual([
      MISSING.TEAM_NAME,
      MISSING.TEAM_NAME,
    ]);
  });
  it("should generate roster information with injected player information", () => {
    const league = setupLeague();
    const results = league.getResults(players);
    const week1Team1Results = results[0].weeklyResults[0].roster;
    expect(week1Team1Results.map((roster) => roster.firstName)).toStrictEqual([
      "Pete",
      "Barrack",
    ]);
    expect(week1Team1Results.map((roster) => roster.lastName)).toStrictEqual([
      "D",
      "O",
    ]);
    expect(week1Team1Results.map((roster) => roster.team)).toStrictEqual([
      "SNL",
      "POTUS",
    ]);
  });
});