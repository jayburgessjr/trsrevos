import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

import { getClient, listClients } from '@/core/clients/store'
import { getDashboard } from '@/core/exec/store'
import { getMediaState } from '@/core/mediaAgent/store'
import { getProjectsByClient, listProjects } from '@/core/projects/store'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

type RosieIntent =
  | 'client_status'
  | 'project_status'
  | 'email_draft'
  | 'pipeline_summary'
  | 'news_search'
  | 'general'

type IntentDetection = {
  intent: RosieIntent
  clientId?: string
  projectId?: string
}

const openaiApiKey = process.env.OPENAI_API_KEY
const openai = openaiApiKey
  ? new OpenAI({ apiKey: openaiApiKey })
  : null

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: ChatMessage[] }
  const normalizedMessages = Array.isArray(messages) ? messages : []
  const lastUser = [...normalizedMessages].reverse().find((message) => message.role === 'user')
  const detection = detectIntent(lastUser?.content ?? '')
  const context = buildContext(detection)
  const prompt = buildIntentPrompt(detection)

  if (!openai) {
    const offline = buildOfflineResponse(detection, context)
    return streamText(offline)
  }

  const systemPrompt =
    'You are Rosie, the TRS internal assistant. You have full context of company data, clients, projects, and workflows. You help operators summarize, retrieve, and act on TRS information with precision. Respond naturally but concisely, reason about the intent before replying, and confirm before executing any irreversible actions.'

  const payload = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'system' as const, content: prompt },
  ]

  if (context) {
    payload.push({ role: 'system' as const, content: `Context for reasoning:\n${context}` })
  }

  payload.push(...normalizedMessages)

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      temperature: 0.2,
      messages: payload,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices?.[0]?.delta?.content
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
        } catch (error) {
          console.error('Rosie stream error', error)
          controller.enqueue(encoder.encode('\n[Rosie experienced an issue while streaming the response.]'))
        } finally {
          controller.close()
        }
      },
    })

    return new NextResponse(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Rosie completion error', error)
    return streamText('Rosie could not reach the reasoning service. Please retry in a moment.')
  }
}

function detectIntent(query: string): IntentDetection {
  if (!query) {
    return { intent: 'general' }
  }

  const text = query.toLowerCase()
  const matchedClient = matchClient(text)
  const matchedProject = matchProject(text, matchedClient?.id)

  if (/email|send|draft|outreach|update/.test(text)) {
    return { intent: 'email_draft', clientId: matchedClient?.id }
  }

  if (/pipeline|forecast|revenue movement|coverage|risk/.test(text)) {
    return { intent: 'pipeline_summary' }
  }

  if (/news|headlines|industry|market|intel/.test(text)) {
    return { intent: 'news_search', clientId: matchedClient?.id }
  }

  if (matchedProject && /project|phase|milestone|architecture|implementation|where are we/.test(text)) {
    return { intent: 'project_status', clientId: matchedClient?.id, projectId: matchedProject.id }
  }

  if (matchedClient && /status|latest|note|summary|update|health|how are we/.test(text)) {
    return { intent: 'client_status', clientId: matchedClient.id }
  }

  return matchedClient
    ? { intent: 'client_status', clientId: matchedClient.id }
    : { intent: 'general' }
}

function matchClient(text: string) {
  if (!text) return null
  const clients = listClients()
  return (
    clients.find((client) => {
      const name = client.name.toLowerCase()
      const shortName = name.replace(/(inc|corp|corporation|llc|industries)/g, '').trim()
      const aliases = [name, client.id.toLowerCase(), shortName, client.owner?.toLowerCase()].filter(Boolean) as string[]
      return aliases.some((alias) => alias && alias.length > 1 && text.includes(alias))
    }) ?? null
  )
}

function matchProject(text: string, clientId?: string) {
  if (!text) return null
  const projects = listProjects()
  return (
    projects.find((project) => {
      if (clientId && project.clientId !== clientId) {
        return false
      }
      const name = project.name.toLowerCase()
      const phase = project.phase?.toLowerCase()
      return text.includes(name) || (phase && text.includes(phase))
    }) ?? null
  )
}

function buildIntentPrompt(detection: IntentDetection) {
  const base = [`Detected intent: ${detection.intent}`]
  if (detection.clientId) {
    base.push(`Client target: ${detection.clientId}`)
  }
  if (detection.projectId) {
    base.push(`Project target: ${detection.projectId}`)
  }
  base.push(
    'When intent is email_draft, return a subject line and a short actionable body the operator can copy-paste. When intent is pipeline_summary or news_search, highlight the top 2-3 signals with numbers.',
  )
  return base.join('\n')
}

function buildContext(detection: IntentDetection) {
  switch (detection.intent) {
    case 'client_status':
    case 'email_draft':
      return detection.clientId ? buildClientContext(detection.clientId) : ''
    case 'project_status':
      return buildProjectContext(detection.projectId, detection.clientId)
    case 'pipeline_summary':
      return buildPipelineContext()
    case 'news_search':
      return buildNewsContext(detection.clientId)
    default:
      return buildGeneralContext()
  }
}

function buildClientContext(clientId?: string) {
  if (!clientId) return ''
  const client = getClient(clientId)
  if (!client) return ''

  const projects = getProjectsByClient(client.id)
  const opportunities = client.opportunities?.map((opp) => `${opp.name} (${formatCurrency(opp.amount)} • ${opp.stage}${opp.probability ? ` • win ${Math.round(opp.probability * 100)}%` : ''}${opp.nextStep ? ` • next: ${opp.nextStep} on ${opp.nextStepDate ?? 'TBD'}` : ''})`) ?? []
  const dataStatus = client.data?.map((source) => `${source.name} (${source.category}) → ${source.status}`) ?? []
  const contacts = client.contacts?.map((person) => `${person.name} – ${person.role}${person.power ? ` (${person.power})` : ''}`) ?? []
  const kanban = client.kanban?.map((card) => `${card.title} [${card.status}${card.owner ? ` • ${card.owner}` : ''}]`) ?? []

  return [
    `Client overview: ${client.name} (${client.phase} phase • owner ${client.owner})`,
    `Segment ${client.segment} • ARR ${formatCurrency(client.arr ?? 0)} • Industry ${client.industry} • Region ${client.region}`,
    `Health ${client.health ?? 0}/100 • Churn risk ${client.churnRisk ?? 0}% • QBR ${client.qbrDate ?? 'TBD'} • Expansion ${client.isExpansion ? 'yes' : 'no'}`,
    client.notes ? `Latest note: ${client.notes}` : '',
    opportunities.length ? `Opportunities: ${opportunities.join('; ')}` : '',
    contacts.length ? `Buying group: ${contacts.join('; ')}` : '',
    dataStatus.length ? `Data sources: ${dataStatus.join('; ')}` : '',
    projects.length
      ? `Active projects: ${projects
          .map((project) => `${project.name} (${project.phase} • ${project.progress}% • health ${project.health})`)
          .join('; ')}`
      : '',
    kanban.length ? `Execution board: ${kanban.join('; ')}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function buildProjectContext(projectId?: string, clientId?: string) {
  if (!projectId && !clientId) return ''
  const projects = projectId
    ? listProjects().filter((project) => project.id === projectId)
    : getProjectsByClient(clientId ?? '')
  if (!projects.length) return ''

  return projects
    .map((project) => {
      const deliverables = project.deliverables?.join(', ')
      return [
        `Project ${project.name} for ${project.clientName}:`,
        `Phase ${project.phase} • Status ${project.status} • Health ${project.health} • Progress ${project.progress}%`,
        `Owner ${project.owner} • Start ${project.startDate} • Due ${project.dueDate}`,
        deliverables ? `Key deliverables: ${deliverables}` : '',
        project.notes ? `Notes: ${project.notes}` : '',
        `Budget ${formatCurrency(project.budget ?? 0)} • Spent ${formatCurrency(project.spent ?? 0)}`,
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
}

function buildPipelineContext() {
  const dashboard = getDashboard()
  const ribbon = dashboard.ribbon
  const pricing = dashboard.pricing
  const alerts = dashboard.alerts?.slice(0, 3) ?? []

  return [
    `Pipeline coverage ${dashboard.sales.pipelineCoverageX}x • Win rate 7d ${dashboard.sales.winRate7dPct}% • Cycle time median ${dashboard.sales.cycleTimeDaysMedian} days`,
    `Forecast horizon ${dashboard.forecast.horizonWeeks} weeks • Risk index ${ribbon.riskIndexPct}% • TRS score ${ribbon.trsScore}%`,
    `Cash on hand ${formatCurrency(ribbon.cashOnHand)} • Runway ${ribbon.runwayDays} days • AR total ${formatCurrency(dashboard.finance.arTotal)}`,
    pricing?.guardrailBreaches?.length
      ? `Pricing guardrail breaches: ${pricing.guardrailBreaches
          .map((breach) => `${breach.account} at ${breach.discountPct}% by ${breach.owner}`)
          .join('; ')}`
      : '',
    alerts.length
      ? `Alerts: ${alerts
          .map((alert) => `${alert.kind} (${alert.severity}) – ${alert.message}`)
          .join('; ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function buildNewsContext(clientId?: string) {
  const state = getMediaState()
  const client = clientId ? getClient(clientId) : null
  const ideas = state.ideas.slice(0, 3).map((idea) => `${idea.title} for ${idea.persona} (${idea.stage} stage • impact ${idea.expectedImpact})`)
  const projects = state.projects
    .slice(0, 2)
    .map((project) => `Project ${project.id} status ${project.status}${project.artifacts?.podcastUrl ? ` • podcast ${project.artifacts.podcastUrl}` : ''}`)
  const distributions = state.distributions.slice(0, 2).map((entry) => `${entry.channel} published ${entry.publishedAt}`)

  return [
    client ? `Focus client: ${client.name} (${client.industry})` : '',
    ideas.length ? `Media ideas: ${ideas.join('; ')}` : '',
    projects.length ? `Media projects: ${projects.join('; ')}` : '',
    distributions.length ? `Recent distribution: ${distributions.join('; ')}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function buildGeneralContext() {
  const clients = listClients()
  const summary = clients
    .map((client) => `${client.name} • Phase ${client.phase} • Health ${client.health} • ARR ${formatCurrency(client.arr ?? 0)}`)
    .join('; ')
  return `Active clients snapshot: ${summary}`
}

function buildOfflineResponse(detection: IntentDetection, context: string) {
  const intro = 'Rosie is currently offline, so here is a direct context pull from RevenueOS:'
  const focus = detection.clientId ? `\nFocus client: ${getClient(detection.clientId)?.name ?? detection.clientId}` : ''
  return `${intro}${focus}${context ? `\n\n${context}` : ''}`
}

function streamText(text: string) {
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text))
      controller.close()
    },
  })
  return new NextResponse(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

function formatCurrency(value: number | undefined) {
  const amount = typeof value === 'number' ? value : 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
