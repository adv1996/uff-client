import { User } from "./Owner.interface";

export interface OwnerResults {
  user: User;
  pointsFor: number;
  pointsAgainst: number;
  weeklyScores: number[]; // TODO this will change to a matchup object
  oppWeeklyScores: number[];
}

export interface Results {
  ownerResults: OwnerResults[];
}
