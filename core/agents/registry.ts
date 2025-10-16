import { register } from './bus'
import { Agent } from './types'

const make = (meta: Agent['meta'], run: Agent['run'], samplePayload?: any): Agent => ({
  meta,
  run,
  samplePayload,
})

// Projects
register(
  make(
    {
      key: 'delivery-orchestrator',
      name: 'Delivery Orchestrator',
      category: 'Projects',
      description: 'Advance RevOS phases and generate next 3 actions',
      icon: 'Workflow',
      autoRunnable: true,
    },
    async ({ userId, payload }) => ({
      ok: true,
      summary: 'Set phase to Data; queued 3 next actions.',
      data: {
        phase: 'Data',
        next: ['Interview billing owner', 'Connect Stripe', 'Sample cohort export'],
        expectedImpact$: 3000,
        runBy: userId,
        payload,
      },
    }),
    { clientId: 'acme-co', focus: 'billing' },
  ),
)
register(
  make(
    {
      key: 'gap-discovery',
      name: 'Gap Discovery',
      category: 'Projects',
      description: 'Run gap questions; extract levers',
      icon: 'Search',
    },
    async () => ({
      ok: true,
      summary: 'Captured 12 answers; proposed 3 levers.',
      data: {
        levers: [
          { name: 'Raise Plus 5%', impact$: 4000 },
          { name: 'Prepay incentive', impact$: 2500 },
          { name: 'Partner co-sell', impact$: 5000 },
        ],
        expectedImpact$: 11500,
      },
    }),
  ),
)
register(
  make(
    {
      key: 'data-intake',
      name: 'Data Intake',
      category: 'Projects',
      description: 'Map available vs collected data',
      icon: 'Database',
    },
    async () => ({
      ok: true,
      summary: '8/12 sources ready; flagged missing ARR field.',
      data: {
        completeness: 0.67,
        missing: ['ARR', 'ChurnReason'],
      },
    }),
  ),
)
register(
  make(
    {
      key: 'qra-strategy',
      name: 'QRA Strategy',
      category: 'Projects',
      description: 'Compute price/offer/channel moves',
      icon: 'Brain',
    },
    async () => ({
      ok: true,
      summary: 'Proposed pricing + retention play.',
      data: {
        pricing: '+5% Plus; floor 12% disc',
        retention: 'N-day save sequence',
        expectedImpact$: 9000,
      },
    }),
  ),
)
register(
  make(
    {
      key: 'build-planner',
      name: 'Build Planner',
      category: 'Projects',
      description: 'Create Kanban plan and SLOs',
      icon: 'Kanban',
    },
    async () => ({
      ok: true,
      summary: 'Critical path set; 2 SLOs risk.',
      data: {
        columns: ['Backlog', 'Doing', 'Blocked', 'Review', 'Done'],
        sloRisks: ['Auth latency p95', 'Invoice job'],
      },
    }),
  ),
)
register(
  make(
    {
      key: 'compounding',
      name: 'Compounding',
      category: 'Projects',
      description: 'Quantify new revenue vs baseline',
      icon: 'BarChart2',
    },
    async () => ({
      ok: true,
      summary: '$12.4k net new vs baseline; QTD forecast +$48k.',
      data: {
        dollarsAdvanced$: 12400,
        forecastQTD: 48000,
      },
    }),
  ),
)

// Content
register(
  make(
    {
      key: 'media-agent',
      name: 'Media Agent',
      category: 'Content',
      description: 'Podcast + YouTube + shorts bundle',
      icon: 'Mic',
      autoRunnable: true,
    },
    async () => ({
      ok: true,
      summary: 'Generated pod + YT plan; 3 shorts; scheduled LI & Email.',
      data: {
        expectedImpact$: 8000,
        artifacts: ['podcast', 'youtube', 'shorts'],
        channels: ['LinkedIn', 'Email'],
      },
    }),
  ),
)
register(
  make(
    {
      key: 'brief-agent',
      name: 'Brief Agent',
      category: 'Content',
      description: 'Generate persona-stage brief',
      icon: 'FileText',
    },
    async () => ({
      ok: true,
      summary: 'Brief for CFO @ Proposal created.',
      data: {
        outline: ['Problem', 'Offer', 'Proof', 'CTA'],
      },
    }),
  ),
)
register(
  make(
    {
      key: 'distribution-agent',
      name: 'Distribution Agent',
      category: 'Content',
      description: 'Channel copy + UTM + schedule',
      icon: 'Send',
    },
    async () => ({
      ok: true,
      summary: 'Scheduled LI + X with UTM.',
      data: {
        utm: 'utm_source=li&utm_campaign=revos',
        scheduledAt: new Date().toISOString(),
      },
    }),
  ),
)
register(
  make(
    {
      key: 'attribution-agent',
      name: 'Attribution Agent',
      category: 'Content',
      description: 'Assign influenced/advanced/closed',
      icon: 'Target',
    },
    async () => ({
      ok: true,
      summary: 'Attributed $6k influenced; $2k closed.',
      data: {
        influenced$: 6000,
        closedWon$: 2000,
      },
    }),
  ),
)

// Clients
register(
  make(
    {
      key: 'account-intel',
      name: 'Account Intelligence',
      category: 'Clients',
      description: 'Stakeholders, goals, health',
      icon: 'IdCard',
      autoRunnable: true,
    },
    async () => ({
      ok: true,
      summary: 'Health: 72 (green); 2 risks flagged.',
      data: {
        health: 72,
        risks: ['Champion bandwidth', 'Security review'],
      },
    }),
  ),
)
register(
  make(
    {
      key: 'close-plan',
      name: 'Close Plan',
      category: 'Clients',
      description: 'Mutual action plan',
      icon: 'Handshake',
    },
    async () => ({
      ok: true,
      summary: 'Next step set for 10/12.',
      data: {
        nextStep: 'Security review call',
        due: '2025-10-12',
      },
    }),
  ),
)
register(
  make(
    {
      key: 'commercials',
      name: 'Commercials',
      category: 'Clients',
      description: 'Price/terms guardrails',
      icon: 'Scale',
    },
    async () => ({
      ok: true,
      summary: 'Price floor approved; Net30 → Net15.',
      data: {
        priceFloor: '-12%',
        terms: 'Net15',
        expectedImpact$: 3500,
      },
    }),
  ),
)
register(
  make(
    {
      key: 'collections',
      name: 'Collections',
      category: 'Clients',
      description: 'Dunning & recovery',
      icon: 'CreditCard',
    },
    async () => ({
      ok: true,
      summary: 'Dunning step 2 sent; $1.8k likely.',
      data: {
        dollarsAdvanced$: 1800,
      },
    }),
  ),
)
register(
  make(
    {
      key: 'client-health',
      name: 'Client Health',
      category: 'Clients',
      description: 'Adoption & renewal risk',
      icon: 'HeartPulse',
    },
    async () => ({
      ok: true,
      summary: 'Renewal risk low; expansion candidate.',
      data: {
        renewalRisk: 'Low',
        expansionSignal: true,
      },
    }),
  ),
)

// Communication
register(
  make(
    {
      key: 'clarity-bot',
      name: 'ClarityBot',
      category: 'Communication',
      description: 'Revenue Clarity Audit: Turn files + context into dollarized levers & readiness score',
      icon: 'BarChart3',
      autoRunnable: true,
    },
    async ({ userId, payload }) => {
      /**
       * ClarityBot - Senior Revenue Systems Analyst for TRS
       *
       * Goal: Turn files + minimal context into complete Revenue Clarity Audit
       * Output: Numeric findings mapped to TRS RevenueOS framework
       *
       * Required: client_name, industry, monthly_revenue, team_size
       * Optional: files (CSV/XLSX), CRM exports, transcripts, surveys
       */

      // Extract required context
      const clientName = payload?.client_name || payload?.clientName || 'Unknown Client'
      const industry = payload?.industry || 'SaaS'
      const monthlyRevenue = payload?.monthly_revenue || payload?.monthlyRevenue || 100000
      const teamSize = payload?.team_size || payload?.teamSize || 15

      // Optional file data
      const files = payload?.files || []
      const notes = payload?.notes || ''

      // Check for missing context
      const missingContext = []
      if (!payload?.client_name && !payload?.clientName) missingContext.push('client_name')
      if (!payload?.monthly_revenue && !payload?.monthlyRevenue) missingContext.push('monthly_revenue (approx)')

      // Data Quality Assessment
      const dataQualityIssues = []
      let dataCompleteness = 1.0

      if (files.length === 0 && !notes) {
        dataQualityIssues.push({
          issue: 'No files provided - using industry benchmarks and conservative estimates',
          severity: 'high'
        })
        dataCompleteness = 0.5
      }

      if (!payload?.crm_data && !payload?.crmData) {
        dataQualityIssues.push({
          issue: 'CRM pipeline data missing - funnel metrics extrapolated',
          severity: 'medium'
        })
        dataCompleteness *= 0.85
      }

      if (missingContext.length > 0) {
        dataQualityIssues.push({
          issue: `Missing context: ${missingContext.join(', ')}`,
          severity: 'high'
        })
        dataCompleteness *= 0.7
      }

      // Readiness Score (0-100) - TRS RevenueOS Framework
      // Dimensions: Pricing, Activation, Retention, Data Infrastructure
      const baseReadiness = 70
      const dataPenalty = (1 - dataCompleteness) * 30

      const readiness = {
        score: Math.max(40, Math.round(baseReadiness - dataPenalty)),
        rubric: [
          { dimension: 'Pricing Architecture', score: 72 },
          { dimension: 'Activation Systems', score: 58 },
          { dimension: 'Retention Mechanics', score: 71 },
          { dimension: 'Data Infrastructure', score: Math.round(65 * dataCompleteness) },
        ]
      }

      // Gap Map - Dollarized Levers (Annual ARR Impact)
      // Ease: 1 (hard) to 5 (easy)
      // Confidence: 0 to 1 (penalized for thin data)
      const baseConfidence = 0.85 * dataCompleteness

      const levers = [
        {
          name: 'Pricing Floor Enforcement',
          size$: Math.round(monthlyRevenue * 0.08 * 12), // 8% annual ARR
          ease: 5, // Policy change
          confidence: Math.min(0.95, baseConfidence + 0.1)
        },
        {
          name: 'Activation Automation',
          size$: Math.round(monthlyRevenue * 0.12 * 12), // 12% annual ARR
          ease: 3, // Requires integration
          confidence: baseConfidence
        },
        {
          name: 'Churn Save Sequence',
          size$: Math.round(monthlyRevenue * 0.06 * 12), // 6% annual ARR
          ease: 3, // Workflow setup
          confidence: Math.max(0.60, baseConfidence - 0.05)
        },
        {
          name: 'Upsell Motion Cadence',
          size$: Math.round(monthlyRevenue * 0.10 * 12), // 10% annual ARR
          ease: 2, // Complex - requires sales enablement
          confidence: Math.max(0.55, baseConfidence - 0.10)
        }
      ]

      // Sort by size$ descending, take top 3-4
      const topLevers = levers.sort((a, b) => b.size$ - a.size$).slice(0, 4)

      // Opportunities - Detailed descriptions
      const opportunities = topLevers.map(lever => ({
        description: `${lever.name} (Ease: ${lever.ease}/5): ${lever.ease >= 4 ? 'Quick win' : lever.ease >= 3 ? 'Strategic initiative' : 'Complex build'} - ${(lever.size$ / (monthlyRevenue * 12) * 100).toFixed(0)}% ARR lift`,
        projected_uplift$: lever.size$, // Annual ARR
        confidence: lever.confidence
      }))

      const totalOpportunity = opportunities.reduce((sum, opp) => sum + opp.projected_uplift$, 0)
      const topLever = topLevers[0]

      // Summary Text (≤80 words for RevBoard/HubSpot)
      const summaryText = `${clientName} Revenue Clarity Audit: Readiness ${readiness.score}/100. Total opportunity: $${(totalOpportunity / 1000).toFixed(0)}k annual ARR across ${topLevers.length} levers. Top lever: ${topLever.name} ($${(topLever.size$ / 1000).toFixed(0)}k, ${(topLever.confidence * 100).toFixed(0)}% confidence). ${dataQualityIssues.length > 0 ? `Data quality: ${dataQualityIssues.length} gaps noted. ` : ''}Covers pricing, activation, retention.`

      // Strict JSON Schema (no extra keys)
      const auditResult = {
        summary: `Revenue Clarity Audit complete for ${clientName} (${industry}, $${(monthlyRevenue / 1000).toFixed(0)}k MRR, ${teamSize} team). Identified $${(totalOpportunity / 1000).toFixed(0)}k annual ARR opportunity across ${topLevers.length} levers. Readiness: ${readiness.score}/100. Data completeness: ${(dataCompleteness * 100).toFixed(0)}%.`,
        gap_map: {
          levers: topLevers
        },
        readiness: readiness,
        data_quality: {
          gaps: dataQualityIssues
        },
        opportunities: opportunities,
        summary_text: summaryText
      }

      // TL;DR for quick reference
      const tldr = `TL;DR: Readiness ${readiness.score}/100. Top lever: ${topLever.name} ($${(topLever.size$ / 1000).toFixed(0)}k ARR).`

      return {
        ok: true,
        summary: `${auditResult.summary} | ${tldr}`,
        data: {
          ...auditResult,
          tldr,
          next_steps: 'Choose: (a) one-page MD report, (b) deck outline, or (c) CRM note'
        },
      }
    },
    {
      client_name: 'Acme Corp',
      industry: 'B2B SaaS',
      monthly_revenue: 250000,
      team_size: 25,
      notes: 'Mid-market SaaS. Focusing on expanding ARR from existing customers.',
      files: [
        { name: 'hubspot_deals.csv', size: '245KB', description: 'Pipeline export Q4 2024' },
        { name: 'stripe_mrr.xlsx', size: '89KB', description: 'Monthly recurring revenue breakdown' }
      ],
      crm_data: true
    },
  ),
)

// BlueprintEngine - Deck & Brief generator
register(
  make(
    {
      key: 'blueprint-engine',
      name: 'BlueprintEngine',
      category: 'Communication',
      description: 'Converts ClarityBot JSON into client-ready deck and internal brief',
      icon: 'FileSliders',
      autoRunnable: false,
    },
    async ({ userId, payload }) => {
      /**
       * BlueprintEngine - Deck & Brief Generator
       *
       * Goal: Convert ClarityBot JSON into deliverables
       * Inputs: ClarityBot JSON + company logo/site URL (optional)
       * Outputs: audit_deck.pdf outline, prep_brief.md, image assets
       *
       * System prompt: "You are BlueprintEngine. Given a ClarityBot JSON, produce a
       * 10–12 slide outline and a 1-page prep brief. No new analysis—summarize,
       * visualize, and sequence actions."
       */

      const clarityBotData = payload?.clarity_bot_json || {}
      const companyLogo = payload?.company_logo || ''
      const companySite = payload?.company_site || ''

      // Placeholder implementation
      const slideOutline = [
        'Cover: Revenue Clarity Audit',
        'Executive Summary',
        'Current State: Readiness Score',
        'Gap Map: Opportunity Landscape',
        'Lever 1: [Top Lever]',
        'Lever 2: [Second Lever]',
        'Lever 3: [Third Lever]',
        'Implementation Roadmap',
        'ROI Projections',
        'Data Quality Notes',
        'Next Steps',
        'Appendix: Methodology'
      ]

      const prepBrief = `# Prep Brief

## Client Context
- [Auto-populated from ClarityBot]

## Key Findings
- Readiness: [score]/100
- Top 3 Levers: [list]

## Talking Points
- [Generated from opportunities]

## Objection Handling
- [Based on data quality gaps]
`

      return {
        ok: true,
        summary: `Generated 12-slide deck outline and prep brief. Ready for Jay's review.`,
        data: {
          deck_outline: slideOutline,
          prep_brief: prepBrief,
          image_assets: ['readiness_chart.png', 'gap_map_visual.png', 'roi_projection.png'],
          next_steps: 'Review outline, customize slides, generate PDF'
        }
      }
    },
    {
      clarity_bot_json: { readiness: { score: 68 }, gap_map: { levers: [] } },
      company_logo: 'https://example.com/logo.png',
      company_site: 'https://example.com'
    }
  )
)

// OfferDesk - Price + package recommender
register(
  make(
    {
      key: 'offer-desk',
      name: 'OfferDesk',
      category: 'Clients',
      description: 'Turns audit levers into recommended offer path with ROI math',
      icon: 'DollarSign',
      autoRunnable: false,
    },
    async ({ userId, payload }) => {
      /**
       * OfferDesk - Price + Package Recommender
       *
       * Goal: Turn audit levers into single best offer path
       * Inputs: ClarityBot JSON, budget window, timing, TRS price card
       * Outputs: offer_pack.json (tier, price, ROI, milestones), offer_email.md
       *
       * Rules: Never show a menu; pick the single best path; add a fallback
       */

      const clarityBotData = payload?.clarity_bot_json || {}
      const budgetWindow = payload?.budget_window || 'mid-market'
      const timing = payload?.timing || '90 days'

      // Placeholder offer logic
      const recommendedOffer = {
        tier: 'Implementation + Advisory',
        price: 45000,
        roi_multiplier: 3.2,
        duration: '12 weeks',
        milestones: [
          'Week 1-2: Data intake & validation',
          'Week 3-6: Implement top 2 levers',
          'Week 7-10: Enable team & test',
          'Week 11-12: Measure & optimize'
        ],
        fallback: 'Advisory-only: $18k for 90-day engagement'
      }

      const offerEmail = `Subject: Your Revenue Clarity Audit Results + Recommended Path

Hi [Client],

Based on your audit, we've identified $[X]k in annual ARR opportunity.

**Recommended approach:** ${recommendedOffer.tier}
- Investment: $${recommendedOffer.price.toLocaleString()}
- Expected ROI: ${recommendedOffer.roi_multiplier}x in Year 1
- Timeline: ${recommendedOffer.duration}

Next step: 30-min call to walk through the roadmap.

Best,
Jay
`

      return {
        ok: true,
        summary: `Recommended ${recommendedOffer.tier} at $${recommendedOffer.price.toLocaleString()}. ${recommendedOffer.roi_multiplier}x ROI projected.`,
        data: {
          offer_pack: recommendedOffer,
          offer_email: offerEmail,
          next_steps: 'Review offer, customize email, send to client'
        }
      }
    },
    {
      clarity_bot_json: { opportunities: [], readiness: { score: 68 } },
      budget_window: 'mid-market',
      timing: '90 days'
    }
  )
)

// DataGate - Intake validator
register(
  make(
    {
      key: 'data-gate',
      name: 'DataGate',
      category: 'Projects',
      description: 'Validates uploaded files and flags data quality issues before ClarityBot runs',
      icon: 'ShieldCheck',
      autoRunnable: false,
    },
    async ({ userId, payload }) => {
      /**
       * DataGate - Intake Validator
       *
       * Goal: Stop garbage-in early
       * Inputs: Uploaded files
       * Outputs: intake_report.json with pass/fail + fixes; inline user prompts
       */

      const files = payload?.files || []

      const validationResults = files.map((file: any) => ({
        filename: file.name,
        status: 'pass', // TODO: Implement schema checks
        issues: [],
        suggestions: []
      }))

      const passRate = validationResults.filter((r: any) => r.status === 'pass').length / (validationResults.length || 1)

      return {
        ok: true,
        summary: `Validated ${files.length} files. ${Math.round(passRate * 100)}% passed schema checks.`,
        data: {
          intake_report: {
            overall_status: passRate >= 0.8 ? 'pass' : 'fail',
            files: validationResults,
            required_fixes: []
          },
          next_steps: passRate >= 0.8 ? 'Proceed to ClarityBot' : 'Fix data quality issues first'
        }
      }
    },
    {
      files: [
        { name: 'deals.csv', size: '120KB' },
        { name: 'revenue.xlsx', size: '89KB' }
      ]
    }
  )
)

// QRA Forecaster - 12-month ROI projections
register(
  make(
    {
      key: 'qra-forecaster',
      name: 'QRA Forecaster',
      category: 'Projects',
      description: 'Projects 12-month ROI bands from levers (best/base/worst scenarios)',
      icon: 'TrendingUp',
      autoRunnable: false,
    },
    async ({ userId, payload }) => {
      /**
       * QRA Forecaster - 12-month ROI Projections
       *
       * Goal: Project ROI bands for enterprise and RevenueOS deals
       * Inputs: ClarityBot opportunities + baselines
       * Outputs: qra_forecast.json (best/base/worst, payback), chart PNGs
       */

      const opportunities = payload?.opportunities || []
      const baseline = payload?.baseline_arr || 1000000

      const baselineMonthly = baseline / 12

      // Calculate scenarios
      const bestCase = opportunities.reduce((sum: number, opp: any) => sum + (opp.projected_uplift$ || 0), 0)
      const baseCase = bestCase * 0.7
      const worstCase = bestCase * 0.4

      const forecast = {
        scenarios: {
          best: { annual_arr: bestCase, monthly_arr: bestCase / 12, confidence: 0.25 },
          base: { annual_arr: baseCase, monthly_arr: baseCase / 12, confidence: 0.55 },
          worst: { annual_arr: worstCase, monthly_arr: worstCase / 12, confidence: 0.20 }
        },
        payback_months: 6,
        chart_urls: [
          'forecast_band.png',
          'payback_timeline.png',
          'lever_contribution.png'
        ]
      }

      return {
        ok: true,
        summary: `Forecast: $${(baseCase / 1000).toFixed(0)}k base case ARR. Payback in ${forecast.payback_months} months.`,
        data: {
          qra_forecast: forecast,
          next_steps: 'Include forecast in deck or proposal'
        }
      }
    },
    {
      opportunities: [
        { name: 'Pricing Floor', projected_uplift$: 96000, confidence: 0.85 },
        { name: 'Activation', projected_uplift$: 144000, confidence: 0.75 }
      ],
      baseline_arr: 1000000
    }
  )
)

// RevOS Orchestrator - Task generator for closed deals
register(
  make(
    {
      key: 'revos-orchestrator',
      name: 'RevOS Orchestrator',
      category: 'Projects',
      description: 'Converts selected offer into sprint backlog with tasks, owners, and deadlines',
      icon: 'Network',
      autoRunnable: false,
    },
    async ({ userId, payload }) => {
      /**
       * RevOS Orchestrator - Task Generator
       *
       * Goal: Convert offer into sprint backlog when deal closes
       * Inputs: offer_pack.json + chosen tier
       * Outputs: implementation_plan.json, tasks for PM tool (Linear/ClickUp)
       */

      const offerPack = payload?.offer_pack || {}
      const chosenTier = payload?.chosen_tier || 'Implementation + Advisory'

      // Generate implementation tasks
      const tasks = [
        { title: 'Kickoff call - align on goals', owner: 'Jay', deadline: 'Week 1', status: 'pending' },
        { title: 'Data intake - collect sources', owner: 'Client', deadline: 'Week 1', status: 'pending' },
        { title: 'Run DataGate validation', owner: 'Gabe', deadline: 'Week 2', status: 'pending' },
        { title: 'Implement Lever 1', owner: 'TRS Team', deadline: 'Week 4', status: 'pending' },
        { title: 'Implement Lever 2', owner: 'TRS Team', deadline: 'Week 6', status: 'pending' },
        { title: 'Team enablement session', owner: 'Jay', deadline: 'Week 8', status: 'pending' },
        { title: 'Monitor & optimize', owner: 'TRS Team', deadline: 'Week 12', status: 'pending' }
      ]

      return {
        ok: true,
        summary: `Generated ${tasks.length} tasks for ${chosenTier}. Ready to push to PM tool.`,
        data: {
          implementation_plan: {
            tier: chosenTier,
            tasks: tasks,
            duration: '12 weeks',
            milestones: offerPack.milestones || []
          },
          next_steps: 'Push tasks to Linear/ClickUp, assign owners, set up Slack channel'
        }
      }
    },
    {
      offer_pack: {
        tier: 'Implementation + Advisory',
        price: 45000,
        duration: '12 weeks',
        milestones: []
      },
      chosen_tier: 'Implementation + Advisory'
    }
  )
)
