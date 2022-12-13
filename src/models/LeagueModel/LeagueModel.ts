import {
  AtLeast,
  League,
  Matchup,
  Owner,
  OwnerResults,
  Platform,
  Settings,
  User,
} from "../../interfaces";
import { DraftPick } from "../../interfaces/Draft.interface";
import { Player, PlayerStat } from "../../interfaces/Player.interface";
import { Transaction } from "../../interfaces/Transaction.interface";
import {
  assembleOwnerMatchups,
  generateCSV,
  tracePlayerHistory,
} from "../utils/utils";

abstract class LeagueModel implements League {
  public settings: AtLeast<Settings, "id" | "platform">;
  public matchups: Record<number, Matchup[]> = {};
  public transactions: Record<number, Transaction[]> = {};
  public draftPicks: DraftPick[] = [];
  public owners: Owner[] = [];
  public users: User[] = [];
  public isDevelopment: boolean;

  constructor(id: string, platform: Platform, isDevelopment = false) {
    this.settings = { id, platform };
    this.isDevelopment = isDevelopment;
  }
  getBaseURL(): `http${string}` {
    throw new Error("Method not implemented.");
  }

  setSettings(settings: Partial<Settings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  setOwners(owners: Owner[]): void {
    this.owners = owners;
  }

  setUsers(users: User[]): void {
    this.users = users;
  }

  initialize(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  retrieveMatchups(_start: number, _end: number): Promise<Matchup[][]> {
    throw new Error("Method not implemented");
  }

  retrieveTransactions(_start: number, _end: number): Promise<Transaction[]> {
    throw new Error("Method not implemented");
  }

  retrieveDraft(): Promise<DraftPick[]> {
    throw new Error("Method not implemented");
  }

  // FUTURE add capability for certain weeks or users (almost like a filter)
  // What other filters would others like to use?
  getResults(players: Player[], playerStats: PlayerStat[]): OwnerResults[] {
    return assembleOwnerMatchups(
      this.users,
      this.owners,
      this.matchups,
      players,
      playerStats,
      this.settings
    );
  }

  getResultsCSV(players: Player[], playerStats: PlayerStat[]): string {
    const results = this.getResults(players, playerStats);
    return generateCSV(results);
  }

  getPlayerHistory(): Record<string, string[]> {
    return tracePlayerHistory(
      this.draftPicks,
      Object.values(this.transactions).flat()
    );
  }
}

export type { League };
export { LeagueModel };
