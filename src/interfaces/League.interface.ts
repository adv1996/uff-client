import {
  AtLeast,
  Matchup,
  Owner,
  OwnerResults,
  Platform,
  Settings,
  WithPrefix,
} from ".";
import { Player } from "./Player.interface";

export interface ILeagueClient {
  players: Player[];
  leagues: League[];
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
  loadPlayers(): Promise<Player[]>;
}

export interface League {
  settings: AtLeast<Settings, "id" | "platform">;
  matchups: Record<number, Matchup[]>;
  owners: Owner[];
  isDevelopment: boolean;
  initialize(): Promise<void>;
  retrieveMatchups(start: number, end: number): Promise<Matchup[][]>;
  getResults(players: Player[]): OwnerResults[];
  downloadResults(players: Player[]): string;
  getBaseURL(): WithPrefix<"http">;
}
