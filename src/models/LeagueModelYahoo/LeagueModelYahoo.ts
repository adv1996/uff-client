import { Matchup, WithPrefix } from "../../interfaces";
import { DraftPick } from "../../interfaces/Draft.interface";
import {
  RawYahooSettingsSchema,
  RawYahooStandingsSchema,
} from "../../interfaces/LeagueYahoo.interface";
import { Transaction } from "../../interfaces/Transaction.interface";
import { LeagueModel } from "../LeagueModel/LeagueModel";
import fetchJson from "../utils/utils";

const DEV_URL = "http://localhost:3000/api";
const BASE_YAHOO_URL = "https://fantasysports.yahooapis.com/fantasy/v2";
// TODO this must be passed in
const YAHOO_URL =
  `https://abf3-207-38-137-29.ngrok-free.app/api/test?api=${BASE_YAHOO_URL}` as WithPrefix<"http">;

// TODO allow users to choose past years
const SEASON = "423";

class LeagueModelYahoo extends LeagueModel {
  getBaseURL(): WithPrefix<"http"> {
    return this.isDevelopment ? DEV_URL : YAHOO_URL;
  }

  async initialize(): Promise<void> {
    const { id } = this.settings;
    const BASE_URL = this.getBaseURL();
    const settingsURL = `${BASE_URL}/league/${SEASON}.l.${id}?format=json`;
    const standingsURL = `${BASE_URL}/league/${SEASON}.l.${id}/standings?format=json`;
    const rawSettings = await fetchJson(settingsURL);
    const rawStandings = await fetchJson(standingsURL);

    try {
      const validatedSettings = RawYahooSettingsSchema.parse(rawSettings);
      // eslint-disable-next-line no-console
      console.log(validatedSettings);
      // this.setSettings(validatedData);
      const validatedStandings =
        RawYahooStandingsSchema(10).parse(rawStandings);
      // eslint-disable-next-line no-console
      console.log(validatedStandings);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("JSON data validation failed:", error);
    }
    // this.setSettings(settings[0]);

    // return Promise.resolve();
  }

  async retrieveMatchups(start: number, end: number): Promise<Matchup[][]> {
    return Promise.resolve([]);
  }

  async retrieveTransactions(
    start: number,
    end: number
  ): Promise<Transaction[]> {
    return Promise.resolve([]);
  }

  async retrieveDraft(): Promise<DraftPick[]> {
    return Promise.resolve([]);
  }
}

export { LeagueModelYahoo };
