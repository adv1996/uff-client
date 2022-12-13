import { WithPrefix } from "./Shared.interface";

export interface RawSleeperSettings {
  name: string;
  roster_positions: string[];
  season: string;
  season_type: string;
  sport: string;
  status: string;
  total_rosters: number;
  scoring_settings: Record<string, number>;
  draft_id: string;
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

interface RawSleeperTradedDraftPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
}

interface RawSleeperTransactionMetadata {
  notes: string;
}

export interface RawSleeperTransaction {
  type: string;
  transaction_id: string;
  status_updated: number; // EPOCH
  status: string;
  settings?: {
    waiver_bid: number;
    seq: number;
  };
  roster_ids: number[];
  metadata: RawSleeperTransactionMetadata | null;
  leg: number;
  drops: Record<string, number> | null;
  draft_picks: RawSleeperTradedDraftPick[];
  creator: string;
  created: number;
  consentor_ids: number[];
  adds: Record<string, number> | null;
}

export interface RawSleeperDraftPick {
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string;
  pick_no: number;
  draft_slot: number;
  draft_id: string;
}
