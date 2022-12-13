import {
  Matchup,
  Owner,
  RawSleeperDraftPick,
  RawSleeperMatchup,
  RawSleeperRoster,
  RawSleeperSettings,
  RawSleeperTransaction,
  RawSleeperUser,
  Settings,
  transformResponse,
  User,
  WithPrefix,
} from "../../interfaces";
import { DraftPick } from "../../interfaces/Draft.interface";
import { Transaction } from "../../interfaces/Transaction.interface";

type transformMatchupByWeek = (
  week: number
) => transformResponse<RawSleeperMatchup, Matchup>;

type transformTransactionByWeek = (
  week: number
) => transformResponse<RawSleeperTransaction, Transaction>;

const avatarURL = (user: RawSleeperUser): WithPrefix<"https://"> => {
  if (user?.metadata?.avatar) {
    return user.metadata.avatar;
  }
  return `https://sleepercdn.com/avatars/thumbs/${user.avatar}`;
};

export const transformSettings: transformResponse<
  RawSleeperSettings,
  Partial<Settings>
> = (settings) => {
  return {
    name: settings["name"],
    rosterPositions: settings["roster_positions"],
    season: settings["season"],
    seasonType: settings["season_type"],
    sport: settings["sport"],
    status: settings["status"],
    totalRosters: settings["total_rosters"],
    scoringSettings: settings["scoring_settings"],
    draftId: settings["draft_id"],
  };
};

export const transformMatchup: transformMatchupByWeek =
  (week: number) => (matchup) => {
    return {
      week,
      startersPoints: matchup.starters_points,
      starters: matchup.starters,
      rosterId: matchup.roster_id,
      points: matchup.points,
      playersPoints: matchup.players_points,
      players: matchup.players,
      matchupId: matchup.matchup_id,
    };
  };

export const transformTransaction: transformTransactionByWeek =
  (week: number) => (transaction) => {
    return {
      week,
      type: transaction.type,
      transactionId: transaction.transaction_id,
      statusUpdated: transaction.status_updated,
      status: transaction.status,
      adds: transaction.adds,
      drops: transaction.drops,
      tradedDraftPicks: transaction.draft_picks.map((d) => {
        return {
          season: d.season,
          round: d.round,
          rosterId: d.roster_id,
          previousOwnerId: d.previous_owner_id,
          ownerId: d.owner_id,
        };
      }),
      rosterIds: transaction.roster_ids,
      waiverBid:
        (transaction.settings && transaction.settings.waiver_bid) || null,
      seq: (transaction.settings && transaction.settings.waiver_bid) || null,
    };
  };

export const transformOwner: transformResponse<RawSleeperRoster, Owner> = (
  roster
) => {
  return {
    ownerId: roster.owner_id,
    rosterId: roster.roster_id,
  };
};

export const transformUser: transformResponse<RawSleeperUser, User> = (
  user
): User => {
  return {
    userId: user.user_id,
    displayName: user.display_name,
    teamName: user?.metadata?.team_name || user.display_name,
    avatar: avatarURL(user),
  };
};

export const transformDraft: transformResponse<
  RawSleeperDraftPick,
  DraftPick
> = (pick): DraftPick => {
  return {
    round: pick.round,
    rosterId: pick.roster_id,
    playerId: pick.player_id,
    pickedBy: pick.picked_by,
    pickNo: pick.pick_no,
    draftSlot: pick.draft_slot,
  };
};
