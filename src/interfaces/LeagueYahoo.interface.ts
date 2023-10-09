import { z } from "zod";

export interface RawYahooSettings {
  name: string;
  roster_positions: string[];
  season: string;
  season_type: string;
  sport: string;
  status: string;
  total_rosters: number;
  scoring_settings: Record<string, number>;
  draft_id: string;
}

const StatModifier = z.object({
  stat_id: z.number(),
  value: z.string(),
});

const Stat = z.object({
  stat_id: z.number(),
  enabled: z.string(),
  name: z.string(),
  display_name: z.string(),
  group: z.string(),
  abbr: z.string(),
  sort_order: z.string(),
  position_type: z.string(),
  stat_position_types: z.array(
    z.object({ position_type: z.string(), is_only_display_stat: z.string() })
  ),
  is_only_display_stat: z.string(),
});

const Group = z.object({
  group_name: z.string(),
  group_display_name: z.string(),
  group_abbr: z.string(),
});

const StatsCategory = z.object({
  stats: z.array(
    z.object({
      stat: Stat,
    })
  ),
  groups: z.array(Group),
});

const StatModifiers = z.object({
  stats: z.array(
    z.object({
      stat: StatModifier,
    })
  ),
});

const RosterPosition = z.object({
  position: z.string(),
  position_type: z.string(),
  count: z.number(),
  is_starting_position: z.number(),
});

const RosterPositions = z.array(z.object({ roster_position: RosterPosition }));

const Settings = z.object({
  draft_type: z.string(),
  is_auction_draft: z.string(),
  scoring_type: z.string(),
  uses_playoff: z.string(),
  has_playoff_consolation_games: z.boolean(),
  playoff_start_week: z.string(),
  uses_playoff_reseeding: z.number(),
  uses_lock_eliminated_teams: z.number(),
  num_playoff_teams: z.string(),
  num_playoff_consolation_teams: z.number(),
  has_multiweek_championship: z.number(),
  waiver_type: z.string(),
  waiver_rule: z.string(),
  uses_faab: z.string(),
  draft_time: z.string(),
  draft_pick_time: z.string(),
  post_draft_players: z.string(),
  max_teams: z.string(),
  waiver_time: z.string(),
  trade_end_date: z.string(),
  trade_ratify_type: z.string(),
  trade_reject_time: z.string(),
  player_pool: z.string(),
  cant_cut_list: z.string(),
  draft_together: z.number(),
  sendbird_channel_url: z.string(),
  roster_positions: RosterPositions,
  stat_categories: StatsCategory,
  stat_modifiers: StatModifiers,
  uses_median_score: z.boolean(),
  league_premium_features: z.array(z.unknown()),
  pickem_enabled: z.string(),
  uses_fractional_points: z.string(),
  uses_negative_points: z.string(),
});

const League = z.object({
  league_key: z.string(),
  league_id: z.string(),
  name: z.string(),
  url: z.string(),
  logo_url: z.string(),
  draft_status: z.string(),
  num_teams: z.number(),
  edit_key: z.string(),
  weekly_deadline: z.string(),
  league_update_timestamp: z.string(),
  scoring_type: z.string(),
  league_type: z.string(),
  renew: z.string(),
  renewed: z.string(),
  felo_tier: z.string(),
  iris_group_chat_id: z.string(),
  allow_add_to_dl_extra_pos: z.number(),
  is_pro_league: z.string(),
  is_cash_league: z.string(),
  current_week: z.number(),
  start_week: z.string(),
  start_date: z.string(),
  end_week: z.string(),
  end_date: z.string(),
  is_plus_league: z.string(),
  game_code: z.string(),
  season: z.string(),
  settings: z.array(Settings),
});

const FantasyContent = z.object({
  "xml:lang": z.string(),
  "yahoo:uri": z.string(),
  league: z.array(League),
  time: z.string(),
  copyright: z.string(),
  refresh_rate: z.string(),
});

const TeamSchema = z.object({
  team_key: z.string(),
  team_id: z.string(),
  name: z.string(),
  url: z.string(),
  team_logos: z.array(
    z.object({
      team_logo: z.object({
        size: z.string(),
        url: z.string(),
      }),
    })
  ),
  waiver_priority: z.number(),
  number_of_moves: z.number(),
  number_of_trades: z.number(),
  roster_adds: z.object({
    coverage_type: z.string(),
    coverage_value: z.number(),
    value: z.string(),
  }),
  league_scoring_type: z.string(),
  draft_position: z.number(),
  has_draft_grade: z.number(),
  draft_grade: z.string(),
  draft_recap_url: z.string(),
  managers: z.array(
    z.object({
      manager: z.object({
        manager_id: z.string(),
        nickname: z.string(),
        guid: z.string(),
        image_url: z.string(),
        felo_score: z.string(),
        felo_tier: z.string(),
      }),
    })
  ),
});

export const RawYahooStandingsSchema = (numTeams: number) =>
  z.object({
    fantasy_content: z.object({
      "xml:lang": z.string(),
      "yahoo:uri": z.string(),
      league: z.array(
        z.object({
          league_key: z.string(),
          league_id: z.string(),
          name: z.string(),
          url: z.string(),
          logo_url: z.string(),
          draft_status: z.string(),
          num_teams: z.number(),
          edit_key: z.string(),
          weekly_deadline: z.string(),
          league_update_timestamp: z.string(),
          scoring_type: z.string(),
          league_type: z.string(),
          renew: z.string(),
          renewed: z.string(),
          felo_tier: z.string(),
          iris_group_chat_id: z.string(),
          allow_add_to_dl_extra_pos: z.number(),
          is_pro_league: z.string(),
          is_cash_league: z.string(),
          current_week: z.number(),
          start_week: z.string(),
          start_date: z.string(),
          end_week: z.string(),
          end_date: z.string(),
          is_plus_league: z.string(),
          game_code: z.string(),
          season: z.string(),
          standings: z.array(
            z.object({
              teams: z.object(
                Object.fromEntries(
                  Array.from({ length: numTeams }, (_, i) => [
                    i.toString(),
                    z.object({
                      team: z.array(TeamSchema.partial()),
                    }),
                  ])
                )
              ),
            })
          ),
        })
      ),
    }),
  });

export const RawYahooSettingsSchema = z.object({
  fantasy_content: FantasyContent,
});

export type RawYahooSettingsSchemaType = z.infer<typeof RawYahooSettingsSchema>;
