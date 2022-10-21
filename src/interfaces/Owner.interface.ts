import { WithPrefix } from "./Shared.interface";

export interface Owner {
  rosterId: number;
  ownerId: string;
}

export interface User {
  userId: string;
  displayName: string;
  teamName: string;
  avatar: WithPrefix<"https://">;
}
