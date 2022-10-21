import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapvalues";
import range from "lodash/range";
import sum from "lodash/sum";
import { Matchup, Owner, Platform, Results, User } from "../../interfaces";
import { League } from "../LeagueModel/LeagueModel";
import { LeagueModelSleeper } from "../LeagueModelSleeper";

const createLeagueModel = (id: string, platform: Platform): League => {
  // there should be only 1 swtich for platform that determines everything else
  switch (platform) {
    case Platform.SLEEPER:
      return new LeagueModelSleeper(id, platform);
    case Platform.ESPN:
      return new LeagueModelSleeper(id, platform);
  }
};

const buildRosterUserMap = (
  users: User[],
  owners: Owner[]
): Record<number, User> => {
  const ownerUserMap: Record<string, User> = keyBy(users, "userId");
  const rosterOwnerMap: Record<number, Owner> = keyBy(owners, "rosterId");
  return mapValues(rosterOwnerMap, (owner) => ownerUserMap[owner.ownerId]);
};

// this is a perfect thing to unit test...
const assembleOwnerMatchups = (
  users: User[],
  owners: Owner[],
  matchups: Record<number, Matchup[]>
): Results => {
  const rosterMap = buildRosterUserMap(users, owners);
  const weeks = Object.keys(matchups);
  const ownerMatchupsMap: Record<number, Matchup[]> = {};
  const opponentMatchupsMap: Record<number, Matchup[]> = {};

  weeks.forEach((week) => {
    const weekMatchups = matchups[parseInt(week)];

    const matchupPairs = groupBy(weekMatchups, "matchupId");
    Object.values(matchupPairs).forEach((pair) => {
      const [matchup1, matchup2] = pair;

      // ADD first matchup and their opponents (matchup2)
      if (!(matchup1.rosterId in ownerMatchupsMap)) {
        ownerMatchupsMap[matchup1.rosterId] = [matchup1];
        opponentMatchupsMap[matchup1.rosterId] = [matchup2];
      } else {
        ownerMatchupsMap[matchup1.rosterId].push(matchup1);
        opponentMatchupsMap[matchup1.rosterId].push(matchup2);
      }

      // ADD second matchup and their opponents (matchup1)
      if (!(matchup2.rosterId in ownerMatchupsMap)) {
        ownerMatchupsMap[matchup2.rosterId] = [matchup2];
        opponentMatchupsMap[matchup2.rosterId] = [matchup1];
      } else {
        ownerMatchupsMap[matchup2.rosterId].push(matchup2);
        opponentMatchupsMap[matchup2.rosterId].push(matchup1);
      }
    });
  });

  const ownerResults = Object.keys(ownerMatchupsMap).map((owner) => {
    const rosterId = parseInt(owner);
    const matchups = ownerMatchupsMap[rosterId];
    const oppMatchups = opponentMatchupsMap[rosterId];
    const weeklyScores = matchups.map((matchup) => matchup.points);
    const oppWeeklyScores = oppMatchups.map((matchup) => matchup.points);
    return {
      user: rosterMap[rosterId],
      pointsFor: sum(weeklyScores),
      pointsAgainst: sum(oppWeeklyScores),
      weeklyScores,
      oppWeeklyScores,
    };
  });

  return {
    ownerResults,
  };
};

const create = async (id: string, platform: Platform) => {
  let league = createLeagueModel(id, platform);
  await league.initialize();
  return league;
};

export { create, createLeagueModel, range, assembleOwnerMatchups };
