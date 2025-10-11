export const PIPELINE_STAGE_ORDER = [
  "New",
  "Qualify",
  "Proposal",
  "Negotiation",
  "ClosedWon",
  "ClosedLost",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGE_ORDER)[number];

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  New: "Prospect",
  Qualify: "Qualify",
  Proposal: "Proposal",
  Negotiation: "Negotiation",
  ClosedWon: "Closed Won",
  ClosedLost: "Closed Lost",
};

export const PIPELINE_STAGE_PROBABILITIES: Record<PipelineStage, number> = {
  New: 10,
  Qualify: 25,
  Proposal: 50,
  Negotiation: 75,
  ClosedWon: 100,
  ClosedLost: 0,
};

export const PIPELINE_STAGE_COLORS: Partial<Record<PipelineStage, string>> = {
  New: "bg-gray-100",
  Qualify: "bg-blue-100",
  Proposal: "bg-purple-100",
  Negotiation: "bg-yellow-100",
  ClosedWon: "bg-green-100",
};
