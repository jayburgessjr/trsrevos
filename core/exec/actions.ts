"use server";
import { getDashboard, setScope } from "./store";
import { TimeScope, Segment } from "./types";

export async function getExecDashboard() { return getDashboard(); }
export async function setExecScope(scope: { time: TimeScope; segment: Segment }) {
  return setScope(scope.time, scope.segment);
}

// "Do-something" stubs the dashboard can trigger
export async function createCommitSet(week: number) { return { ok:true, week }; }
export async function generateCollectionsList(daysAccelerate: number) { return { ok:true, dsoSaved: daysAccelerate }; }
export async function openDealDeskFor(ids: string[]) { return { ok:true, count: ids.length }; }
export async function exportBoardDeck() { return { ok:true, url: "/exports/exec-brief.pdf" }; }
