import { User } from "./Owner.interface";

export enum OUTCOME {
  WIN = "WIN",
  LOSS = "LOSS",
  TIE = "TIE",
}

interface WeeklyResults {
  matchupId: number;
  week: number;
  pointsFor: number;
  pointsAgainst: number;
  outcome: OUTCOME;
}

export interface OwnerResults {
  user: User;
  totalPointsFor: number;
  totalPointsAgainst: number;
  weeklyResults: WeeklyResults[];
}
