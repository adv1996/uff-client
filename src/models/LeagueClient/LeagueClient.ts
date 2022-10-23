import { Subject } from "rxjs";
import { ILeagueClient, League, Platform } from "../../interfaces";
import { create } from "../utils";

class LeagueClient implements ILeagueClient {
  public leagues: League[] = [];
  public subject = new Subject<League[]>();

  async addLeague(id: string, platform: Platform): Promise<void> {
    const league = await create(id, platform);
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

  onMessage() {
    return this.subject.asObservable();
  }
}

export { LeagueClient };
