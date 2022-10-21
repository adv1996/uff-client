import { Matchup, Owner, Results, Settings } from ".";

export interface League {
  settings: Partial<Settings>;
  matchups: Record<number, Matchup[]>;
  owners: Owner[];
  initialize(): Promise<void>;
  retrieveMatchups(start: number, end: number): Promise<Matchup[][]>;
  getResults(): Results;
}
