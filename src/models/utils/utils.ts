import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapvalues";
import sumBy from "lodash/sumBy";
import zipWith from "lodash/zipWith";
import {
  Matchup,
  OUTCOME,
  Owner,
  OwnerResults,
  Platform,
  transformResponse,
  User,
} from "../../interfaces";
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

const calculateOutcome = (pointsA = 0, pointsB = 0): OUTCOME => {
  if (pointsA > pointsB) {
    return OUTCOME.WIN;
  } else if (pointsA < pointsB) {
    return OUTCOME.LOSS;
  }
  return OUTCOME.TIE;
};

const assembleOwnerMatchups = (
  users: User[],
  owners: Owner[],
  matchups: Record<number, Matchup[]>
): OwnerResults[] => {
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
    const weeklyResults = zipWith(matchups, oppMatchups, (team1, team2) => {
      return {
        week: team1.week,
        pointsFor: team1.points,
        pointsAgainst: team2.points,
        outcome: calculateOutcome(team1.points, team2.points),
      };
    });
    return {
      user: rosterMap[rosterId],
      weeklyResults,
      totalPointsFor: sumBy(weeklyResults, "pointsFor"),
      totalPointsAgainst: sumBy(weeklyResults, "pointsAgainst"),
    };
  });

  return ownerResults;
};

const create = async (id: string, platform: Platform) => {
  let league = createLeagueModel(id, platform);
  await league.initialize();
  return league;
};

const fetchWrapper = async <T, U extends {}>(
  url: string,
  transform: transformResponse<T, U>
): Promise<U[]> => {
  const response = await fetch(url);
  const data = await response.json();
  if (response.ok) {
    if (data && Array.isArray(data)) {
      return Promise.resolve(data.map(transform));
    } else if (data && !Array.isArray(data)) {
      return Promise.resolve([data].map(transform));
    } else {
      return Promise.reject(new Error(`Not Found`));
    }
  } else {
    return Promise.reject(new Error("Request failed"));
  }
};

export { create, createLeagueModel, assembleOwnerMatchups, fetchWrapper };
