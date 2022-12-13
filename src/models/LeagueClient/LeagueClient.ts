import {
  ILeagueClient,
  League,
  LeagueState,
  Platform,
  Player,
  PlayerStat,
  RawPlayerStat,
} from "@/interfaces";
import { Subject } from "rxjs";
import { create } from "../utils";

// TODO move to constants file
const PLAYERS_URL =
  "https://raw.githubusercontent.com/adv1996/uff-client/main/pipeline/players.json";

const PLAYERS_STAT_URL = "http://127.0.0.1:4400/stats";

const loadLocalPlayers = async (): Promise<any> => {
  return await import("../../../pipeline/players.json").then(
    (module) => module.default
  );
};

const loadLocalState = async (): Promise<any> => {
  return await import("../../../pipeline/state.json").then(
    (module) => module.default
  );
};

class LeagueClient implements ILeagueClient {
  public players: Player[] = [];
  public playerStats: PlayerStat[] = [];
  public leagues: League[] = [];
  public subject = new Subject<League[]>();
  public state: Partial<LeagueState> = {};

  async addLeague(
    id: string,
    platform: Platform,
    isDevelopment = false
  ): Promise<void> {
    await create(id, platform, isDevelopment)
      .then((league) => {
        this.leagues.push(league);
        return this.subject.next(this.leagues);
      })
      .catch((error) => Promise.reject(error));
  }

  removeLeague(id: string) {
    const removeIndex = this.leagues.findIndex(
      (league) => league.settings.id === id
    );

    if (removeIndex >= 0) {
      this.leagues.splice(removeIndex, 1);
      return this.subject.next(this.leagues);
    }
    return this.subject.next(this.leagues);
  }

  async retrieveMatchupsByLeague(
    id: string,
    start: number,
    end: number
  ): Promise<void> {
    const findIndex = this.leagues.findIndex(
      (league) => league.settings.id === id
    );
    if (findIndex >= 0) {
      await this.leagues[findIndex].retrieveMatchups(start, end);
      return this.subject.next(this.leagues);
    }
    return this.subject.next(this.leagues);
  }

  async retrieveTransactionsByLeague(
    id: string,
    start: number,
    end: number
  ): Promise<void> {
    const findIndex = this.leagues.findIndex(
      (league) => league.settings.id === id
    );
    if (findIndex >= 0) {
      await this.leagues[findIndex].retrieveTransactions(start, end);
      return this.subject.next(this.leagues);
    }
    return this.subject.next(this.leagues);
  }

  async retrieveDraftByLeague(id: string): Promise<void> {
    const findIndex = this.leagues.findIndex(
      (league) => league.settings.id === id
    );
    if (findIndex >= 0) {
      await this.leagues[findIndex].retrieveDraft();
      return this.subject.next(this.leagues);
    }
    return this.subject.next(this.leagues);
  }
  // should this use the consolidate fetchWrapper func?
  async loadPlayers(isDevelopment = false): Promise<Player[]> {
    if (isDevelopment) {
      const data = await loadLocalPlayers();
      this.players = data;
      return data;
    }
    const response = await fetch(PLAYERS_URL);
    const data: Player[] = await response.json();
    if (response.ok) {
      if (data && Array.isArray(data)) {
        this.players = data;
        return Promise.resolve(data);
      } else {
        return Promise.reject(new Error(`Not Found`));
      }
    } else {
      return Promise.reject(new Error("Request failed"));
    }
  }

  async loadPlayerStats(): Promise<PlayerStat[]> {
    const response = await fetch(PLAYERS_STAT_URL);
    const data: RawPlayerStat[] = await response.json();
    if (response.ok) {
      if (data && Array.isArray(data)) {
        const transformed = data.map((d) => {
          return {
            pid: d.pid,
            week: d.week,
            passTD: d?.pass_td || 0,
            rushTD: d?.rush_td || 0,
            recTD: d?.rec_td || 0,
            fumRecTD: d?.fum_rec_td || 0,
            stTD: d?.st_td || 0,
            defStTD: d?.def_st_td || 0,
            defTD: d?.def_td || 0,
            idpDefTD: d?.idp_def_td || 0,
            ptsTD: 0,
          };
        });
        this.playerStats = transformed;
        return Promise.resolve(transformed);
      } else {
        return Promise.reject(new Error(`Not Found`));
      }
    } else {
      return Promise.reject(new Error("Request failed"));
    }
  }

  async getLeagueState(isDevelopment = false): Promise<LeagueState> {
    if (isDevelopment) {
      const data = await loadLocalState();
      this.state = data;
      return data;
    }
    const response = await fetch("https://api.sleeper.app/v1/state/nfl");
    const data = await response.json();
    if (response.ok) {
      if (data) {
        this.state = data;
        return Promise.resolve(data);
      } else {
        return Promise.reject(new Error(`Not Found`));
      }
    } else {
      return Promise.reject(new Error("Request failed"));
    }
  }

  onMessage() {
    return this.subject.asObservable();
  }
}

export { LeagueClient };
