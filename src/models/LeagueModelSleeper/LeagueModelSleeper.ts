import range from "lodash/range";
import { Matchup, Owner, Settings, User, WithPrefix } from "../../interfaces";
import { LeagueModel } from "../LeagueModel/LeagueModel";
import { fetchWrapper } from "../utils/utils";
import {
  transformMatchup,
  transformOwner,
  transformSettings,
  transformUser,
} from "./transform";

const DEV_URL = "http://localhost:3000/api";
const SLEEPER_URL = "https://api.sleeper.app/v1";

class LeagueModelSleeper extends LeagueModel {
  getBaseURL(): WithPrefix<"http"> {
    return this.isDevelopment ? DEV_URL : SLEEPER_URL;
  }

  async initialize(): Promise<void> {
    const { id } = this.settings;
    const BASE_URL = this.getBaseURL();
    // what if this isn't a real league -> need to gracefully handle errors
    // TODO handle errors what if one of them fails?
    const settings: Partial<Settings>[] = await fetchWrapper(
      `${BASE_URL}/league/${id}`,
      transformSettings
    );
    const owners: Owner[] = await fetchWrapper(
      `${BASE_URL}/league/${id}/rosters`,
      transformOwner
    );
    const users: User[] = await fetchWrapper(
      `${BASE_URL}/league/${id}/users`,
      transformUser
    );

    this.setSettings(settings[0]);
    this.setOwners(owners);
    this.setUsers(users);

    return Promise.resolve();
  }

  async retrieveMatchups(start: number, end: number): Promise<Matchup[][]> {
    const { id } = this.settings;
    const BASE_URL = this.getBaseURL();
    const matchupRange = range(start, end);
    const matchups = matchupRange.map((week) => {
      if (week in this.matchups) {
        return Promise.resolve(this.matchups[week]);
      }
      return fetchWrapper(
        `${BASE_URL}/league/${id}/matchups/${week}`,
        transformMatchup(week)
      );
    });
    const results = await Promise.all(matchups);
    // TODO move this to a setter
    matchupRange.forEach((week, index) => {
      this.matchups[week] = results[index];
    });
    return results;
  }
}

export { LeagueModelSleeper };
