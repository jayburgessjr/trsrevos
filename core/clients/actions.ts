'use server'

import { moveKanban, saveGapAnswers, setQRA, toggleCollectedSource, updateStatus } from './store'
import type { RevosPhase } from './types'

export async function actionSetStatus(id: string, phase: RevosPhase) {
  return updateStatus(id, phase)
}

export async function actionSaveGap(id: string, answers: Array<{ id: string; q: string; a: string }>) {
  return saveGapAnswers(id, answers)
}

export async function actionToggleSource(id: string, src: string) {
  return toggleCollectedSource(id, src)
}

export async function actionMoveKanban(id: string, card: string, from: string, to: string) {
  return moveKanban(id, card as any, from as any, to as any)
}

export async function actionSaveQRA(id: string, notes: string) {
  return setQRA(id, notes)
}
