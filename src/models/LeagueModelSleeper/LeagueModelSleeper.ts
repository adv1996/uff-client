import { Matchup, Owner, Settings, User, WithPrefix } from "../../interfaces";
import {
  RawSleeperMatchup,
  RawSleeperRoster,
  RawSleeperSettings,
  RawSleeperUser,
} from "../../interfaces/LeagueSleeper.interface";
import { LeagueModel } from "../LeagueModel/LeagueModel";
import { range } from "../utils/utils";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : "https://api.sleeper.app/v1";

// how to make sure this is easy to change if the api changes?
// is there an easy way to write these transform
const transformResponse = (settings: RawSleeperSettings): Partial<Settings> => {
  return {
    name: settings["name"],
    rosterPositions: settings["roster_positions"],
    season: settings["season"],
    seasonType: settings["season_type"],
    sport: settings["sport"],
    status: settings["status"],
    totalRosters: settings["total_rosters"],
  };
};

// this looks very similar to code above
const transformMatchup =
  (week: number) =>
  (matchup: RawSleeperMatchup): Matchup => {
    return {
      week,
      startersPoints: matchup.starters_points,
      starters: matchup.starters,
      rosterId: matchup.roster_id,
      points: matchup.points,
      playersPoints: matchup.players_points,
      players: matchup.players,
      matchupId: matchup.matchup_id,
    };
  };

const transformOwner = (roster: RawSleeperRoster): Owner => {
  return {
    ownerId: roster.owner_id,
    rosterId: roster.roster_id,
  };
};

const avatarURL = (user: RawSleeperUser): WithPrefix<"https://"> => {
  if (user?.metadata?.avatar) {
    return user.metadata.avatar;
  }
  return `https://sleepercdn.com/avatars/thumbs/${user.avatar}`;
};

const transformUser = (user: RawSleeperUser): User => {
  return {
    userId: user.user_id,
    displayName: user.display_name,
    teamName: user?.metadata?.team_name || user.display_name,
    avatar: avatarURL(user),
  };
};

const fetchSleeperLeague = async <Settings>(
  leagueId: string
): Promise<Settings> => {
  const response = await fetch(`${BASE_URL}/league/${leagueId}`);
  const settings = await response.json();
  if (response.ok) {
    if (settings) {
      // transform based on the platform (need to make everything generic)
      return Promise.resolve(Object.assign(transformResponse(settings)));
    } else {
      return Promise.reject(new Error(`No league found`));
    }
  } else {
    return Promise.reject(new Error("Request failed"));
  }
};

const fetchSleeperMatchup = async (
  leagueId: string,
  week: number
): Promise<Matchup[]> => {
  const response = await fetch(
    `${BASE_URL}/league/${leagueId}/matchups/${week}`
  );
  const matchups: RawSleeperMatchup[] = await response.json();
  if (response.ok) {
    if (matchups) {
      return Promise.resolve(matchups.map(transformMatchup(week)));
    } else {
      return Promise.reject(new Error(`No league found`));
    }
  } else {
    return Promise.reject(new Error("Request failed"));
  }
};

const fetchSleeperRosters = async (leagueId: string): Promise<Owner[]> => {
  const response = await fetch(`${BASE_URL}/league/${leagueId}/rosters`);
  const rosters: RawSleeperRoster[] = await response.json();
  if (response.ok) {
    if (rosters) {
      return Promise.resolve(rosters.map(transformOwner));
    } else {
      return Promise.reject(new Error(`No league found`));
    }
  } else {
    return Promise.reject(new Error("Request failed"));
  }
};

const fetchSleeperUsers = async (leagueId: string): Promise<User[]> => {
  const response = await fetch(`${BASE_URL}/league/${leagueId}/users`);
  const rosters: RawSleeperUser[] = await response.json();
  if (response.ok) {
    if (rosters) {
      return Promise.resolve(rosters.map(transformUser));
    } else {
      return Promise.reject(new Error(`No league found`));
    }
  } else {
    return Promise.reject(new Error("Request failed"));
  }
};

class LeagueModelSleeper extends LeagueModel {
  async initialize(): Promise<void> {
    const { id } = this.settings;
    // what if this isn't a real league -> need to gracefully handle errors
    // TODO handle errors what if one of them fails?
    const settings: Partial<Settings> = await fetchSleeperLeague(id);
    const owners: Owner[] = await fetchSleeperRosters(id);
    const users: User[] = await fetchSleeperUsers(id);

    this.setSettings(settings);
    this.setOwners(owners);
    this.setUsers(users);

    return Promise.resolve();
  }

  async retrieveMatchups(start: number, end: number): Promise<Matchup[][]> {
    const { id } = this.settings;
    const matchupRange = range(start, end);
    const matchups = matchupRange.map((week) => {
      if (week in this.matchups) {
        return Promise.resolve(this.matchups[week]);
      }
      return fetchSleeperMatchup(id, week);
    });
    const results = await Promise.all(matchups);
    // TODO move this to a setter
    matchupRange.forEach((week, index) => {
      this.matchups[week] = results[index];
    });
    return results;
  }
}

export { LeagueModelSleeper };
