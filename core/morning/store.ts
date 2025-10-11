import { MorningState, Priority } from "./types";

let _state: MorningState = {
  date: new Date().toISOString(),
  momentum: "steady",
  note: "",
  planLocked: false,
  priorities: [],
  kpis: {
    pipelineDollars: 0,
    winRatePct: 0,
    priceRealizationPct: 0,
    focusSessionsToday: 0,
  },
};

export function getMorning(): MorningState { return _state; }

export function setPriorities(list: Priority[]) { _state.priorities = list; return _state; }
export function lockPlan() { _state.planLocked = true; return _state; }
export function incrementFocusSession() { _state.kpis.focusSessionsToday += 1; return _state; }
