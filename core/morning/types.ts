export type ISODate = string;

export type Priority = {
  id: string;
  title: string;
  why: string;
  roi$: number;
  effort: 'Low' | 'Med' | 'High';
  owner: string;
  status: 'Ready' | 'InProgress' | 'Done' | 'Deferred';
};

export type KpiSnap = {
  pipelineDollars: number;
  winRatePct: number;
  priceRealizationPct: number;
  focusSessionsToday: number;
};

export type MorningState = {
  date: ISODate;
  momentum: 'down' | 'steady' | 'up';
  note: string;
  planLocked: boolean;
  priorities: Priority[];
  kpis: KpiSnap;
};
