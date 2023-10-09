export enum Platform {
  SLEEPER = "SLEEPER",
  ESPN = "ESPN",
  YAHOO = "YAHOO",
}

export interface Settings {
  id: string;
  platform: Platform;
  name: string;
  rosterPositions: string[];
  season: string;
  seasonType: string;
  sport: string;
  status: string;
  totalRosters: number;
  scoringSettings: Record<string, number>;
  draftId: string;
}
