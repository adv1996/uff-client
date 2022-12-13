import {
  AtLeast,
  Matchup,
  Owner,
  OwnerResults,
  Platform,
  Player,
  PlayerStat,
  Settings,
  User,
  WithPrefix,
} from ".";
import { DraftPick } from "./Draft.interface";
import { Transaction } from "./Transaction.interface";

export interface LeagueState {
  week: number;
  season_type: string;
  season_start_date: string;
  season: string;
  previous_season: string;
  league_season: "2022";
  display_week: number;
}

export interface ILeagueClient {
  players: Player[];
  playerStats: PlayerStat[];
  leagues: League[];
  state: Partial<LeagueState>;
  addLeague(
    id: string,
    platform: Platform,
    isDevelopment?: boolean
  ): Promise<void>;
  removeLeague(id: string): void;
  retrieveMatchupsByLeague(
    id: string,
    start: number,
    end: number
  ): Promise<void>;
  retrieveTransactionsByLeague(
    id: string,
    start: number,
    end: number
  ): Promise<void>;
  retrieveDraftByLeague(id: string): Promise<void>;
  loadPlayers(isDevelopment?: true): Promise<Player[]>;
  loadPlayerStats(): Promise<PlayerStat[]>;
  getLeagueState(): Promise<LeagueState>;
}

export interface League {
  settings: AtLeast<Settings, "id" | "platform">;
  users: User[];
  matchups: Record<number, Matchup[]>;
  transactions: Record<number, Transaction[]>;
  draftPicks: DraftPick[];
  owners: Owner[];
  isDevelopment: boolean;
  initialize(): Promise<void>;
  retrieveMatchups(start: number, end: number): Promise<Matchup[][]>;
  retrieveTransactions(start: number, end: number): Promise<Transaction[]>;
  retrieveDraft(): Promise<DraftPick[]>;
  getResults(players: Player[], playerStats: PlayerStat[]): OwnerResults[];
  getResultsCSV(players: Player[], playerStats: PlayerStat[]): string;
  getBaseURL(): WithPrefix<"http">;
  getPlayerHistory(
    draft: DraftPick[],
    transactions: Transaction[]
  ): Record<string, string[]>; // TODO replace string[] with enum of player transactions
}
