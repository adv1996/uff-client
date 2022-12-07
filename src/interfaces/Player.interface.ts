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
  pass_td?: number;
  rush_td?: number;
  rec_td?: number;
  fum_rec_td?: number;
  st_td?: number;
  def_st_td?: number;
  def_td?: number;
  idp_def_td?: number;
}

export interface PlayerStat {
  pid: string;
  week: number;
  passTD: number;
  rushTD: number;
  recTD: number;
  fumRecTD: number;
  stTD: number;
  defStTD: number;
  defTD: number;
  idpDefTD: number;
}
