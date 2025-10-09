"use server";

import {
  listClients,
  getClient,
  upsertClient,
  setPhase,
  saveDiscovery,
  saveDataSources,
  saveKanban,
} from "./store";
import { RevOSPhase, DiscoveryQA, DataSource, KanbanItem, Client } from "./types";
import { emitEvent } from "@/core/events/emit";

export async function actionListClients() {
  return listClients();
}
export async function actionGetClient(id: string) {
  return getClient(id);
}
export async function actionSetPhase(id: string, phase: RevOSPhase) {
  const c = setPhase(id, phase);
  if (c) await emitEvent("me", "client", "phase_set", { id, phase });
  return c;
}
export async function actionSaveDiscovery(id: string, qa: DiscoveryQA[]) {
  const c = saveDiscovery(id, qa);
  if (c) await emitEvent("me", "client", "discovery_saved", { id, count: qa.length });
  return c;
}
export async function actionSaveData(id: string, data: DataSource[]) {
  const c = saveDataSources(id, data);
  if (c) await emitEvent("me", "client", "data_saved", { id, available: data.length });
  return c;
}
export async function actionSaveKanban(id: string, cards: KanbanItem[]) {
  const c = saveKanban(id, cards);
  if (c) await emitEvent("me", "client", "kanban_saved", { id, count: cards.length });
  return c;
}
export async function actionUpsertClient(c: Client) {
  return upsertClient(c);
}
