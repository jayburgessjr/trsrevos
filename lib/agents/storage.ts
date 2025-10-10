import { promises as fs } from "fs"
import path from "path"

import type { AgentBehaviorMap, AgentDefinition } from "./types"

const CONFIG_PATH = path.join(process.cwd(), "lib/agents/config.json")
const BEHAVIOR_PATH = path.join(process.cwd(), "lib/agents/config/behavior.json")

async function ensureFile(pathname: string, fallback: string) {
  try {
    await fs.access(pathname)
  } catch {
    await fs.mkdir(path.dirname(pathname), { recursive: true })
    await fs.writeFile(pathname, fallback, "utf8")
  }
}

export async function readAgentsConfig(): Promise<AgentDefinition[]> {
  await ensureFile(
    CONFIG_PATH,
    JSON.stringify(
      {
        agents: [],
      },
      null,
      2,
    ),
  )

  const raw = await fs.readFile(CONFIG_PATH, "utf8")
  const parsed = JSON.parse(raw) as { agents?: AgentDefinition[] }
  return parsed.agents ?? []
}

export async function writeAgentsConfig(agents: AgentDefinition[]) {
  await ensureFile(CONFIG_PATH, JSON.stringify({ agents: [] }, null, 2))
  await fs.writeFile(
    CONFIG_PATH,
    JSON.stringify(
      {
        agents,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  )
}

export async function readAgentBehavior(): Promise<AgentBehaviorMap> {
  await ensureFile(BEHAVIOR_PATH, JSON.stringify({}, null, 2))
  const raw = await fs.readFile(BEHAVIOR_PATH, "utf8")
  return JSON.parse(raw) as AgentBehaviorMap
}

export async function writeAgentBehavior(behavior: AgentBehaviorMap) {
  await ensureFile(BEHAVIOR_PATH, JSON.stringify({}, null, 2))
  await fs.writeFile(BEHAVIOR_PATH, JSON.stringify(behavior, null, 2) + "\n", "utf8")
}
