export interface TradedDraftPick {
  season: string;
  round: number;
  rosterId: number;
  previousOwnerId: number;
  ownerId: number;
}

export interface Transaction {
  week: number;
  type: string; // TODO make enum
  transactionId: string;
  statusUpdated: number;
  status: string; // TODO turn to enum
  adds: Record<string, number> | null;
  drops: Record<string, number> | null;
  tradedDraftPicks: TradedDraftPick[];
  rosterIds: number[];
  waiverBid: number | null;
  seq: number | null;
}
