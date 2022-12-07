import {
  Matchup,
  Owner,
  RawSleeperMatchup,
  RawSleeperRoster,
  RawSleeperSettings,
  RawSleeperUser,
  Settings,
  transformResponse,
  User,
  WithPrefix,
} from "../../interfaces";

type transformMatchupByWeek = (
  week: number
) => transformResponse<RawSleeperMatchup, Matchup>;

const avatarURL = (user: RawSleeperUser): WithPrefix<"https://"> => {
  if (user?.metadata?.avatar) {
    return user.metadata.avatar;
  }
  return `https://sleepercdn.com/avatars/thumbs/${user.avatar}`;
};

export const transformSettings: transformResponse<
  RawSleeperSettings,
  Partial<Settings>
> = (settings) => {
  return {
    name: settings["name"],
    rosterPositions: settings["roster_positions"],
    season: settings["season"],
    seasonType: settings["season_type"],
    sport: settings["sport"],
    status: settings["status"],
    totalRosters: settings["total_rosters"],
    scoringSettings: settings["scoring_settings"],
  };
};

export const transformMatchup: transformMatchupByWeek =
  (week: number) => (matchup) => {
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

export const transformOwner: transformResponse<RawSleeperRoster, Owner> = (
  roster
) => {
  return {
    ownerId: roster.owner_id,
    rosterId: roster.roster_id,
  };
};

export const transformUser: transformResponse<RawSleeperUser, User> = (
  user
): User => {
  return {
    userId: user.user_id,
    displayName: user.display_name,
    teamName: user?.metadata?.team_name || user.display_name,
    avatar: avatarURL(user),
  };
};
