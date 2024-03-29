import {
  AtLeast,
  Matchup,
  OUTCOME,
  Owner,
  OwnerResults,
  Platform,
  Player,
  PlayerStat,
  RosterPlayer,
  Settings,
  transformResponse,
  User,
} from "@/interfaces";
import { Dictionary, orderBy, pick, sum } from "lodash";
import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapvalues";
import sumBy from "lodash/sumBy";
import xor from "lodash/xor";
import zip from "lodash/zip";
import zipWith from "lodash/zipWith";
import { DraftPick } from "../../interfaces/Draft.interface";
import { Transaction } from "../../interfaces/Transaction.interface";
import { League } from "../LeagueModel/LeagueModel";
import { LeagueModelSleeper } from "../LeagueModelSleeper";
import { LeagueModelYahoo } from "../LeagueModelYahoo/LeagueModelYahoo";
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
    case Platform.YAHOO:
      return new LeagueModelYahoo(id, platform, isDevelopment);
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

const fields: (keyof PlayerStat)[] = [
  "passTD",
  "rushTD",
  "recTD",
  "fumRecTD",
  "idpDefTD",
  "stTD",
  "defStTD",
  "defTD",
];

const scoreFields = [
  "pass_td",
  "rush_td",
  "rec_td",
  "fum_rec_td",
  "idp_def_td",
  "st_td",
  "def_st_td",
  "def_td",
];

const scoreTDs = (
  scoringSettings: Record<string, number>,
  playerStat: PlayerStat
) => {
  const ptsTD = sum(
    scoreFields.map((field, index) => {
      const multiplier = field in scoringSettings ? scoringSettings[field] : 0;
      return multiplier * parseInt(playerStat[fields[index]].toString());
    })
  );
  return ptsTD;
};

const createStats = (
  scoringSettings: Record<string, number>,
  playerStatMap: Record<string, Record<string, PlayerStat>>,
  id: string,
  week: string
) => {
  const stats = (id &&
    id in playerStatMap &&
    week in playerStatMap[id] && {
      ptsTD: scoreTDs(scoringSettings, playerStatMap[id][week]),
    }) || {
    ptsTD: 0,
  };
  return stats;
};
const createRoster = (
  week: string,
  playerMap: Dictionary<Player>,
  playerStatMap: Record<string, Record<string, PlayerStat>>,
  starterIds: string[],
  starterPoints: number[],
  rosterIds: string[],
  rosterPoints: Record<string, number>,
  settings: AtLeast<Settings, "id" | "platform">
): RosterPlayer[] => {
  const rosterPositions = settings.rosterPositions || [];
  const starterPositions = rosterPositions.filter(
    (position) => position !== "BN"
  );
  const starterPointsIds = zip(starterIds, starterPoints, starterPositions);
  const starters = starterPointsIds.map((data) => {
    const playerMetaData = getPlayerMetaData(playerMap, data[0]);
    const id = data[0] || "";
    const stats = createStats(
      settings.scoringSettings || {},
      playerStatMap,
      id,
      week
    );
    return {
      ...playerMetaData,
      points: data[1] || 0,
      isStarter: true,
      fantasyPosition: data[2] || "ST", //TODO make this a special case if we can't zip
      stats,
    };
  });

  const bench: RosterPlayer[] = xor(starterIds, rosterIds).map((id) => {
    const playerMetaData = getPlayerMetaData(playerMap, id);
    const stats = createStats(
      settings.scoringSettings || {},
      playerStatMap,
      id,
      week
    );
    return {
      ...playerMetaData,
      points: id in rosterPoints ? rosterPoints[id] : 0,
      isStarter: false,
      fantasyPosition: "BN",
      stats,
    };
  });

  return [...starters, ...bench];
};

const assembleOwnerMatchups = (
  users: User[],
  owners: Owner[],
  matchups: Record<number, Matchup[]>,
  players: Player[],
  playerStats: PlayerStat[],
  settings: AtLeast<Settings, "id" | "platform">
): OwnerResults[] => {
  const rosterMap = buildRosterUserMap(users, owners);
  const weeks = Object.keys(matchups);
  const ownerMatchupsMap: Record<number, Matchup[]> = {};
  const opponentMatchupsMap: Record<number, Matchup[]> = {};

  // # could actually combine the player map and player stats
  const playerMap = keyBy(players, "id");
  const playerStatMap = mapValues(groupBy(playerStats, "pid"), (value) =>
    mapValues(groupBy(value, "week"), (values) => values[0])
  );

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
          team1.week.toString(),
          playerMap,
          playerStatMap,
          team1.starters,
          team1.startersPoints,
          team1.players,
          team1.playersPoints,
          settings
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
  const league = createLeagueModel(id, platform, isDevelopment);
  return await league
    .initialize()
    .then(() => {
      return league;
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};

const fetchWrapper = async <T, U extends {}>(
  url: string,
  transform: transformResponse<T, U>,
  requestOptions?: RequestInit
): Promise<U[]> => {
  const response = await fetch(url, requestOptions);
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

export default async function fetchJson<JSON = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const response = await fetch(input, init);

  // if the server replies, there's always some data in json
  // if there's a network error, it will throw at the previous line
  const data = await response.json();

  // response.ok is true when res.status is 2xx
  // https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
  if (response.ok) {
    return data;
  }

  throw new FetchError({
    message: response.statusText,
    response,
    data,
  });
}

export class FetchError extends Error {
  response: Response;
  data: {
    message: string;
  };
  constructor({
    message,
    response,
    data,
  }: {
    message: string;
    response: Response;
    data: {
      message: string;
    };
  }) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError);
    }

    this.name = "FetchError";
    this.response = response;
    this.data = data ?? { message: message };
  }
}

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
        const starters = roster.filter((player) => player.isStarter);
        return pick(
          {
            displayName: `${result.user.displayName}`,
            teamName: `"${result.user.teamName}"`,
            userId: result.user.userId,
            ...results,
            starterIds: `"${starters.map((player) => player.id).join(",")}"`,
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

const tracePlayerHistory = (
  draftPicks: DraftPick[],
  transactions: Transaction[]
) => {
  const playerMap: Record<string, string[]> = {};
  const sortedTransactions = orderBy(
    Object.values(transactions).flat(),
    ["statusUpdated"],
    ["asc"]
  );
  const insertPlayer = (playerId: string, status: string) => {
    if (playerId in playerMap) {
      playerMap[playerId].push(status);
    } else {
      playerMap[playerId] = [status];
    }
  };
  // add players from draft
  draftPicks.forEach((player) => {
    const { playerId } = player;
    playerMap[playerId] = ["DRAFT"];
  });

  // inject from transactions
  sortedTransactions.forEach((transaction) => {
    const playersToAdd = Object.keys(transaction.adds || {});
    const playersToDrop = Object.keys(transaction.drops || {});

    // TEST ORDER OF TRANSACTIONS
    // TEST WHETHER TRANSACTIONS WAS SUCCESSFUL
    if (transaction.status === "complete") {
      switch (transaction.type) {
        case "waiver":
          playersToAdd.forEach((playerId) => {
            insertPlayer(playerId, "ADDED");
          });
          playersToDrop.forEach((playerId) => {
            insertPlayer(playerId, "DROPPED");
          });
          break;
        case "free_agent":
          playersToAdd.forEach((playerId) => {
            insertPlayer(playerId, "ADDED");
          });
          playersToDrop.forEach((playerId) => {
            insertPlayer(playerId, "DROPPED");
          });
          break;
        case "trade":
          playersToAdd.forEach((playerId) => {
            insertPlayer(playerId, "TRADE");
          });
          break;
        default:
      }
    }
  });
  return playerMap;
};

export {
  create,
  createLeagueModel,
  assembleOwnerMatchups,
  fetchWrapper,
  generateCSV,
  tracePlayerHistory,
};
