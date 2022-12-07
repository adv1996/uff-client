export interface Player {
  id: string | null;
  firstName: string;
  lastName: string;
  positions: string[];
  team: string | null;
}

export interface RawPlayerStat {
  pid: string;
  week: number;
  pass_td: number;
  rush_td: number;
  rec_td: number;
}

export interface PlayerStat {
  pid: string;
  week: number;
  passTD: number;
  rushTD: number;
  recTD: number;
  ptsTD: number;
}
