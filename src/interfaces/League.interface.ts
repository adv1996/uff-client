import {
  AtLeast,
  Matchup,
  Owner,
  OwnerResults,
  Platform,
  Settings,
  WithPrefix,
} from ".";

export interface ILeagueClient {
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
}

export interface League {
  settings: AtLeast<Settings, "id" | "platform">;
  matchups: Record<number, Matchup[]>;
  owners: Owner[];
  isDevelopment: boolean;
  initialize(): Promise<void>;
  retrieveMatchups(start: number, end: number): Promise<Matchup[][]>;
  getResults(): OwnerResults[];
  downloadResults(): string;
  getBaseURL(): WithPrefix<"http">;
}
