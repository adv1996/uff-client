import { WithPrefix } from "./Shared.interface";

export interface RawSleeperSettings {
  name: string;
  roster_positions: string[];
  season: string;
  season_type: string;
  sport: string;
  status: string;
  total_rosters: number;
}

export interface RawSleeperMatchup {
  starters_points: number[];
  starters: string[];
  roster_id: number;
  points: number;
  players_points: Record<string, number>;
  players: string[];
  matchup_id: number;
}

export interface RawSleeperRoster {
  roster_id: number;
  owner_id: string;
}

export interface RawSleeperUser {
  avatar: string;
  display_name: string;
  metadata: {
    team_name?: string;
    avatar?: WithPrefix<"https://">;
  };
  user_id: string;
}
