import range from "lodash/range";
import { Matchup, Owner, User, WithPrefix } from "../../interfaces";
import { DraftPick } from "../../interfaces/Draft.interface";
import { Transaction } from "../../interfaces/Transaction.interface";
import { LeagueModel } from "../LeagueModel/LeagueModel";
import { fetchWrapper } from "../utils/utils";
import {
  transformDraft,
  transformMatchup,
  transformOwner,
  transformSettings,
  transformTransaction,
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

    return fetchWrapper(`${BASE_URL}/league/${id}`, transformSettings)
      .then(async (settings) => {
        this.setSettings(settings[0]);

        const owners: Owner[] = await fetchWrapper(
          `${BASE_URL}/league/${id}/rosters`,
          transformOwner
        );
        const users: User[] = await fetchWrapper(
          `${BASE_URL}/league/${id}/users`,
          transformUser
        );

        this.setOwners(owners);
        this.setUsers(users);
        return Promise.resolve();
      })
      .catch(() => {
        return Promise.reject(new Error("League does not exist"));
      });
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

  async retrieveTransactions(
    start: number,
    end: number
  ): Promise<Transaction[]> {
    const { id } = this.settings;
    const BASE_URL = this.getBaseURL();
    const transactionRange = range(start, end);
    const transactions = transactionRange.map((week) => {
      if (week in this.transactions) {
        return Promise.resolve(this.transactions[week]);
      }
      return fetchWrapper(
        `${BASE_URL}/league/${id}/transactions/${week}`,
        transformTransaction(week)
      );
    });
    const results = await Promise.all(transactions);
    transactionRange.forEach((week, index) => {
      this.transactions[week] = results[index];
    });
    return results.flat();
  }

  async retrieveDraft(): Promise<DraftPick[]> {
    const { draftId } = this.settings;
    const BASE_URL = this.getBaseURL();
    const draftPicks = await fetchWrapper(
      `${BASE_URL}/draft/${draftId}/picks`,
      transformDraft
    );

    if (draftPicks.length > 0) {
      this.draftPicks = draftPicks;
    }
    return Promise.resolve(draftPicks);
  }
}

export { LeagueModelSleeper };
