import {
  AtLeast,
  League,
  Matchup,
  Owner,
  Platform,
  Results,
  Settings,
  User,
} from "../../interfaces";
import { assembleOwnerMatchups } from "../utils/utils";

abstract class LeagueModel implements League {
  public settings: AtLeast<Settings, "id" | "platform">;
  public matchups: Record<number, Matchup[]> = {};
  public owners: Owner[] = [];
  public users: User[] = [];
  constructor(id: string, platform: Platform) {
    this.settings = { id, platform };
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

  // FUTURE add capability for certain weeks or users (almost like a filter)
  // What other filters would others like to use?
  getResults(): Results {
    return assembleOwnerMatchups(this.users, this.owners, this.matchups);
  }
}

export type { League };
export { LeagueModel };
