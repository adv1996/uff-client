import { User } from "./Owner.interface";
import { Player } from "./Player.interface";

export enum OUTCOME {
  WIN = "WIN",
  LOSS = "LOSS",
  TIE = "TIE",
}

export interface RosterPlayer extends Player {
  isStarter: boolean;
  points: number;
  stats?: {
    passTD: number;
    recTD: number;
    rushTD: number;
  };
  fantasyPosition: string;
}

interface WeeklyResults {
  matchupId: number;
  week: number;
  pointsFor: number;
  pointsAgainst: number;
  outcome: OUTCOME;
  roster: RosterPlayer[];
}

export interface OwnerResults {
  user: User;
  totalPointsFor: number;
  totalPointsAgainst: number;
  weeklyResults: WeeklyResults[];
}
