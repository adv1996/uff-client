import { AtLeast, Matchup, Owner, Platform, Results, Settings } from ".";

export interface ILeagueClient {
  leagues: League[];
  addLeague(id: string, platform: Platform): Promise<void>;
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
  initialize(): Promise<void>;
  retrieveMatchups(start: number, end: number): Promise<Matchup[][]>;
  getResults(): Results;
}
