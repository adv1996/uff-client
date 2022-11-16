import {
  Matchup,
  OUTCOME,
  Owner,
  OwnerResults,
  Platform,
  Player,
  RosterPlayer,
  transformResponse,
  User,
} from "@/interfaces";
import { Dictionary, pick } from "lodash";
import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapvalues";
import sumBy from "lodash/sumBy";
import xor from "lodash/xor";
import zip from "lodash/zip";
import zipWith from "lodash/zipWith";
import { League } from "../LeagueModel/LeagueModel";
import { LeagueModelSleeper } from "../LeagueModelSleeper";
import { columns, MISSING } from "./constants";

const createLeagueModel = (
  id: string,
  platform: Platform,
  isDevelopment = false
): League => {
  // there should be only 1 swtich for platform that determines everything else
  switch (platform) {
    case Platform.SLEEPER:
      return new LeagueModelSleeper(id, platform, isDevelopment);
    case Platform.ESPN:
      return new LeagueModelSleeper(id, platform, isDevelopment);
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

const getPlayerMetaData = (
  playerMap: Dictionary<Player>,
  id: string | undefined
) => {
  let playerMetaData: Player = {
    id: MISSING.PLAYER_ID,
    firstName: MISSING.FIRST_NAME,
    lastName: MISSING.LAST_NAME,
    positions: [],
    team: MISSING.TEAM_NAME,
  };
  if (id && id in playerMap) {
    playerMetaData = playerMap[id];
  }
  return playerMetaData;
};

const createRoster = (
  playerMap: Dictionary<Player>,
  starterIds: string[],
  starterPoints: number[],
  rosterIds: string[],
  rosterPoints: Record<string, number>,
  rosterPositions: string[]
): RosterPlayer[] => {
  const starterPositions = rosterPositions.filter(
    (position) => position !== "BN"
  );
  const starterPointsIds = zip(starterIds, starterPoints, starterPositions);
  const starters = starterPointsIds.map((data) => {
    const playerMetaData = getPlayerMetaData(playerMap, data[0]);
    return {
      ...playerMetaData,
      points: data[1] || 0,
      isStarter: true,
      fantasyPosition: data[2] || "ST", //TODO make this a special case if we can't zip
    };
  });

  const bench: RosterPlayer[] = xor(starterIds, rosterIds).map((id) => {
    const playerMetaData = getPlayerMetaData(playerMap, id);
    return {
      ...playerMetaData,
      points: id in rosterPoints ? rosterPoints[id] : 0,
      isStarter: false,
      fantasyPosition: "BN",
    };
  });

  return [...starters, ...bench];
};

const assembleOwnerMatchups = (
  users: User[],
  owners: Owner[],
  matchups: Record<number, Matchup[]>,
  players: Player[],
  rosterPositions: string[]
): OwnerResults[] => {
  const rosterMap = buildRosterUserMap(users, owners);
  const weeks = Object.keys(matchups);
  const ownerMatchupsMap: Record<number, Matchup[]> = {};
  const opponentMatchupsMap: Record<number, Matchup[]> = {};

  const playerMap = keyBy(players, "id");

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
        matchupId: team1.matchupId,
        week: team1.week,
        pointsFor: team1.points,
        pointsAgainst: team2.points,
        outcome: calculateOutcome(team1.points, team2.points),
        roster: createRoster(
          playerMap,
          team1.starters,
          team1.startersPoints,
          team1.players,
          team1.playersPoints,
          rosterPositions
        ),
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

const create = async (
  id: string,
  platform: Platform,
  isDevelopment = false
) => {
  let league = createLeagueModel(id, platform, isDevelopment);
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

const csv = (rows: string[][]) => {
  const csvReady = rows.map((row) => row.join(",")).join("\n");
  return csvReady;
};

// TODO add unit test
const generateCSV = (results: OwnerResults[]) => {
  const transformedResult = results
    .map((result) => {
      return result.weeklyResults.map((weeklyResult) => {
        const { roster, ...results } = weeklyResult;
        return pick(
          {
            displayName: `${result.user.displayName}`,
            teamName: `"${result.user.teamName}"`,
            userId: result.user.userId,
            ...results,
          },
          columns
        );
      });
    })
    .flat();

  const rowData = transformedResult.map((_key, index) => {
    const result = transformedResult[index];
    if (result) return Object.values(result).map(String);
    return [];
  });

  const csvData = csv([columns]).concat(`\n`, csv(rowData));
  return encodeURIComponent(csvData);
};

export {
  create,
  createLeagueModel,
  assembleOwnerMatchups,
  fetchWrapper,
  generateCSV,
};
