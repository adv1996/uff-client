export interface Matchup {
  week: number;
  startersPoints: number[];
  starters: string[];
  rosterId: number;
  points: number;
  playersPoints: Record<string, number>;
  players: string[];
  matchupId: number;
}
