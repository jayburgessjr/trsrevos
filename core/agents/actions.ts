'use server'

import './registry'

import { listAgents, runAgent, logsFor, setEnabled } from './bus'
import { AgentKey } from './types'

const USER = 'me'
const ORG = 'org'

export async function actionListAgents() {
  return listAgents()
}

export async function actionRunAgent(key: AgentKey, payload?: any) {
  return runAgent(key, { userId: USER, orgId: ORG, payload })
}

export async function actionLogs(key: AgentKey) {
  return logsFor(key)
}

export async function actionToggleAgent(key: AgentKey, enabled: boolean) {
  return setEnabled(key, enabled)
}
