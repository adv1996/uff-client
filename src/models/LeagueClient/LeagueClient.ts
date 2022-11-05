import { ILeagueClient, League, Platform, Player } from "@/interfaces";
import { Subject } from "rxjs";
import { create } from "../utils";

// TODO move to constants file
const PLAYERS_URL =
  "https://raw.githubusercontent.com/adv1996/uff-client/main/pipeline/players.json";
class LeagueClient implements ILeagueClient {
  public players: Player[] = [];
  public leagues: League[] = [];
  public subject = new Subject<League[]>();

  async addLeague(
    id: string,
    platform: Platform,
    isDevelopment = false
  ): Promise<void> {
    const league = await create(id, platform, isDevelopment);
    this.leagues.push(league);
    return this.subject.next(this.leagues);
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

  // should this use the consolidate fetchWrapper func?
  async loadPlayers(): Promise<Player[]> {
    const response = await fetch(PLAYERS_URL);
    const data = await response.json();
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
  onMessage() {
    return this.subject.asObservable();
  }
}

export { LeagueClient };
