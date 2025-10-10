import { promises as fs } from "fs"
import path from "path"

import type { IntegrationSettings } from "./types"

const ENV_PATH = path.join(process.cwd(), ".env.local")

async function readEnvFile(): Promise<string> {
  try {
    return await fs.readFile(ENV_PATH, "utf8")
  } catch {
    return ""
  }
}

function parseEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) return
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) return
    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1)
    }
    result[key] = value
  })
  return result
}

function serializeValue(value: string) {
  const escaped = value.replace(/"/g, '\\"')
  return `"${escaped}"`
}

function upsertEnv(original: string, updates: Record<string, string>) {
  const lines = original.split(/\r?\n/)
  const seen = new Set<string>()
  const updatedLines = lines.map((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) return line
    const eqIndex = line.indexOf("=")
    if (eqIndex === -1) return line
    const key = line.slice(0, eqIndex).trim()
    if (updates[key] === undefined) return line
    seen.add(key)
    return `${key}=${serializeValue(updates[key])}`
  })

  Object.entries(updates).forEach(([key, value]) => {
    if (seen.has(key)) return
    updatedLines.push(`${key}=${serializeValue(value)}`)
  })

  return updatedLines.filter((line, idx, arr) => !(idx === arr.length - 1 && line === "")).join("\n") + "\n"
}

export async function getIntegrationSettings(): Promise<IntegrationSettings> {
  const raw = await readEnvFile()
  const parsed = parseEnv(raw)

  return {
    openaiApiKey: parsed.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
    googleApiKey: parsed.GOOGLE_API_KEY ?? process.env.GOOGLE_API_KEY ?? "",
    supabaseUrl: parsed.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey:
      parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    emailService: parsed.EMAIL_SERVICE_PROVIDER ?? process.env.EMAIL_SERVICE_PROVIDER ?? "",
    calendarSyncEnabled:
      (parsed.CALENDAR_SYNC_ENABLED ?? process.env.CALENDAR_SYNC_ENABLED ?? "false").toLowerCase() ===
      "true",
  }
}

export async function saveIntegrationSettings(settings: IntegrationSettings) {
  const original = await readEnvFile()
  const updated = upsertEnv(original, {
    OPENAI_API_KEY: settings.openaiApiKey,
    GOOGLE_API_KEY: settings.googleApiKey,
    NEXT_PUBLIC_SUPABASE_URL: settings.supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: settings.supabaseAnonKey,
    EMAIL_SERVICE_PROVIDER: settings.emailService,
    CALENDAR_SYNC_ENABLED: String(settings.calendarSyncEnabled),
  })

  await fs.mkdir(path.dirname(ENV_PATH), { recursive: true })
  await fs.writeFile(ENV_PATH, updated, "utf8")
}
