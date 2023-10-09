import { Owner, Settings, User, WithPrefix } from "../../interfaces";
import {
  RawYahooSettingsSchema,
  RawYahooSettingsSchemaType,
  RawYahooStandingsSchema,
} from "../../interfaces/LeagueYahoo.interface";

const convertStat = (
  statCategories: RawYahooSettingsSchemaType["fantasy_content"]["league"][number]["settings"][number]["stat_categories"]["stats"],
  statModifiers: RawYahooSettingsSchemaType["fantasy_content"]["league"][number]["settings"][number]["stat_modifiers"]["stats"]
) => {
  const statIds = statCategories.map((stat) => stat.stat.stat_id);

  const statModifierMap = statIds.reduce((acc, cur) => {
    acc[cur.toString()] = 0;
    return acc;
  }, {} as Record<string, number>);

  statModifiers.forEach((modifier) => {
    const statId = modifier.stat.stat_id.toString();
    if (statId in statModifierMap) {
      statModifierMap[statId] = parseFloat(modifier.stat.value);
    }
  });

  return statModifierMap;
};

export const transformSettings = (rawSettings: unknown): Partial<Settings> => {
  try {
    const validatedData = RawYahooSettingsSchema.parse(rawSettings);
    const league = validatedData["fantasy_content"]["league"][0];
    return {
      name: league["name"],
      rosterPositions: league["settings"][0]["roster_positions"].map((rp) => {
        if (rp.roster_position.is_starting_position === 1) {
          return rp.roster_position.position; // TODO convert to FLEX / SUPER_FLEX / IDP_FLEX
        }
        return "BN";
      }),
      season: league["season"],
      // seasonType: settings["season_type"],
      sport: league["game_code"],
      // status: settings["status"],
      totalRosters: league["num_teams"],
      scoringSettings: convertStat(
        league["settings"][0]["stat_categories"]["stats"],
        league["settings"][0]["stat_modifiers"]["stats"]
      ),
      // draftId: settings["draft_id"],
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("JSON data validation failed:", error);
  }
  return {};
};

export const transformStandings = (
  rawStandings: unknown
): [Owner[], User[]] => {
  try {
    const validatedData = RawYahooStandingsSchema(10).parse(rawStandings);
    const league = validatedData["fantasy_content"]["league"][0];
    const owners = Object.keys(league.standings[0]["teams"]).map((key) => {
      const teamInfo = league.standings[0]["teams"][key];
      const managers = teamInfo.team[19].managers || [];
      return {
        rosterId: parseInt(teamInfo.team[1].team_id || "0"),
        ownerId: managers[0].manager.guid,
      };
    });
    const users = Object.keys(league.standings[0]["teams"]).map((key) => {
      const teamInfo = league.standings[0]["teams"][key];
      const managers = teamInfo.team[19].managers || [];
      const logos = teamInfo.team[5].team_logos || [];
      return {
        userId: managers[0].manager.guid,
        displayName: managers[0].manager.guid,
        teamName: managers[0].manager.nickname,
        avatar: logos[0].team_logo.url as WithPrefix<"https://">,
      };
    });

    return [owners, users];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("JSON data validation failed:", error);
  }
  return [[], []];
};
