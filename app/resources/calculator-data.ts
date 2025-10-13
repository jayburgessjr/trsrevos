export type CalculatorDefinition = {
  title: string;
  summary: string;
  playbook: string[];
  inputs: string[];
  outputs: string[];
  notes?: string[];
};

export type CalculatorCategory = {
  id: string;
  name: string;
  description: string;
  calculators: CalculatorDefinition[];
};

export const calculatorCategories: CalculatorCategory[] = [
  {
    id: "core-revenue",
    name: "Core Revenue",
    description:
      "Foundational calculators to baseline every Clarity Audit or ProfitOS install.",
    calculators: [
      {
        title: "Revenue Baseline Calculator",
        summary:
          "Defines the client's current state of play across retention, acquisition, and margin.",
        playbook: [
          "Kick off every engagement with a consistent revenue health benchmark.",
          "Align GTM, finance, and product leaders on the facts before modeling uplift.",
        ],
        inputs: [
          "Latest monthly or annual recurring revenue run rate",
          "Customer counts segmented by product or cohort",
          "Trailing 12-month logo and revenue churn data",
          "CAC payback or acquisition efficiency metrics",
          "Gross margin by product line",
        ],
        outputs: [
          "MRR / ARR trendline",
          "Churn percentage",
          "CAC payback period",
          "Expansion rate",
          "Net revenue retention (NRR)",
          "Gross margin",
        ],
        notes: [
          "Use as the anchor snapshot before layering in compounding profit scenarios.",
        ],
      },
      {
        title: "Compounding Profit Calculator",
        summary:
          "Shows how small improvements in retention, pricing, and acquisition compound over 12–24 months.",
        playbook: [
          "Model the lift from pricing, retention, and demand levers before presenting to leadership.",
          "Stress-test board scenarios or RevOps playbooks prior to investment approvals.",
        ],
        inputs: [
          "Churn rate assumptions",
          "CAC efficiency or spend limits",
          "Gross margin profile",
          "Pricing uplift percentage",
          "Expansion rate or upsell cadence",
        ],
        outputs: [
          "Cumulative profit delta across the modeled period",
          "New break-even point",
          "Updated CAC payback timeline",
          "Contribution margin trajectory",
        ],
        notes: [
          "Overlay with the Cash Flow Simulator to show runway implications for the CFO team.",
        ],
      },
      {
        title: "TRS ROI Calculator",
        summary: "Quantifies incremental profit from a TRS engagement in sales conversations.",
        playbook: [
          "Support executive sponsor pitches with a clear payback narrative.",
          "Co-build ROI stories with RevOps champions during late-stage deals.",
        ],
        inputs: [
          "Current monthly revenue run rate",
          "TRS fee or performance-based share",
          "Target lift percentages by lever",
          "Time-to-value assumptions",
        ],
        outputs: [
          "Incremental profit unlocked",
          "ROI percentage",
          "Payback months",
          "Breakeven date",
          "Projected annualized uplift",
        ],
        notes: [
          "Export the output into executive one-pagers or board-ready memos.",
        ],
      },
    ],
  },
  {
    id: "pricing",
    name: "Pricing",
    description:
      "Pricing is the first intervention lever—quantify elasticity, guardrails, and tier design.",
    calculators: [
      {
        title: "Elasticity & Uplift Calculator",
        summary:
          "Models how a percentage price increase affects revenue, margin, and churn risk.",
        playbook: [
          "Run before proposing price moves to quantify upside and guardrails.",
          "Validate list price and discount limits with finance partners.",
        ],
        inputs: [
          "Current price point by segment or plan",
          "Proposed price increase percentage",
          "Historical churn sensitivity",
          "Gross margin profile",
          "Elasticity assumptions by customer cohort",
        ],
        outputs: [
          "Recommended price point",
          "Margin delta",
          "Forecasted retention impact",
          "Expected ARR uplift",
          "Sensitivity analysis bands",
        ],
        notes: [
          "Pair with tier experiments to socialize acceptable discount guardrails.",
        ],
      },
      {
        title: "Value-Based Pricing Calculator",
        summary: "Ties price to the economic value delivered using EVC best practices.",
        playbook: [
          "Translate customer ROI into price recommendations for enterprise deals.",
          "Anchor pricing conversations on economic impact rather than cost-plus.",
        ],
        inputs: [
          "Customer ROI or economic value delivered",
          "Usage metrics or consumption drivers",
          "Perceived value multiplier by segment",
          "Competitive benchmark pricing",
        ],
        outputs: [
          "Economically justified price range",
          "ROI coverage ratio",
          "Willingness-to-pay tiers",
          "Pricing storyline for sales enablement",
        ],
        notes: [
          "Share alongside customer case studies to reinforce the value narrative.",
        ],
      },
      {
        title: "Tier Optimization Calculator",
        summary: "Optimizes SaaS or service tiers, bundling, and price breaks for margin and expansion.",
        playbook: [
          "Rebuild packaging for new product launches or market repositioning.",
          "Test usage-based versus seat-based mixes before rollout.",
        ],
        inputs: [
          "Current tier structure and pricing",
          "Feature adoption and usage telemetry",
          "Segment willingness-to-pay research",
          "Support and delivery cost per tier",
        ],
        outputs: [
          "Optimized tier recommendations",
          "Feature bundle roadmap",
          "Price break guardrails",
          "Margin impact per tier",
          "Upgrade and expansion opportunities",
        ],
        notes: [
          "Feed outputs into sales playbooks and packaging enablement assets.",
        ],
      },
    ],
  },
  {
    id: "retention-ltv",
    name: "Retention & LTV",
    description: "Retention and lifetime value calculators for post-audit optimization sprints.",
    calculators: [
      {
        title: "Customer Lifetime Value (LTV) Calculator",
        summary: "Quantifies LTV and LTV/CAC to prioritize retention versus acquisition spend.",
        playbook: [
          "Run after baseline to highlight the value of retention lift projects.",
          "Support finance conversations about payback and customer quality.",
        ],
        inputs: [
          "Average revenue per user (ARPU)",
          "Gross churn rate",
          "Gross margin",
          "Customer acquisition cost by segment",
        ],
        outputs: [
          "Customer lifetime value",
          "LTV/CAC ratio",
          "Payback horizon",
          "Expansion-adjusted LTV",
        ],
        notes: [
          "Use with the Churn Impact Calculator to validate retention initiatives.",
        ],
      },
      {
        title: "Churn Impact Calculator",
        summary: "Quantifies how reducing churn translates into retained revenue and cash unlocked.",
        playbook: [
          "Size the upside of retention workstreams for RevOps and Success leaders.",
          "Frame board updates around churn reduction progress.",
        ],
        inputs: [
          "Current churn percentage",
          "Target churn percentage",
          "ARR baseline",
          "Customer counts or cohorts",
          "Time horizon for the change",
        ],
        outputs: [
          "Retained revenue",
          "Total cash unlocked",
          "Gross margin preserved",
          "Impact on net revenue retention",
        ],
        notes: [
          "Feed results into ForecastIQ to adjust revenue expectations by cohort.",
        ],
      },
    ],
  },
  {
    id: "growth-demand",
    name: "Growth & Demand",
    description: "Forecasting and demand design calculators to rebalance acquisition spend.",
    calculators: [
      {
        title: "CAC Efficiency Calculator",
        summary: "Benchmarks CAC payback and ROI by channel to guide budget allocation.",
        playbook: [
          "Compare paid, partner, and outbound motions during planning.",
          "Highlight underperforming acquisition channels for reallocation.",
        ],
        inputs: [
          "Customer acquisition cost per channel",
          "Average revenue per user or contract value",
          "Conversion rate by funnel stage",
          "Payback month target",
          "Channel volume assumptions",
        ],
        outputs: [
          "ROI per acquisition channel",
          "CAC payback comparison",
          "Blended CAC versus target",
          "Channel prioritization map",
        ],
        notes: [
          "Connect to Activation & Funnel Lift results to show end-to-end impact.",
        ],
      },
      {
        title: "Activation & Funnel Lift Calculator",
        summary: "Models how funnel improvements change MRR, CAC, and LTV.",
        playbook: [
          "Quantify onboarding or marketing optimization initiatives.",
          "Demonstrate pipeline velocity improvements to GTM leadership.",
        ],
        inputs: [
          "Baseline conversion rate by funnel stage",
          "Lead or signup volume",
          "Customer acquisition cost before improvements",
          "Activation uplift assumptions",
          "Time-to-activation or onboarding duration",
        ],
        outputs: [
          "Incremental MRR",
          "CAC reduction",
          "New LTV",
          "Pipeline velocity change",
        ],
        notes: [
          "Feed improvements into ForecastIQ for scenario-based revenue modeling.",
        ],
      },
      {
        title: "ForecastIQ Calculator (Revenue Forecast Model)",
        summary: "Forecasts revenue with probabilistic bands across churn, acquisition, and pricing scenarios.",
        playbook: [
          "Build board-ready forecast envelopes with p10/p50/p90 views.",
          "Stress-test budget scenarios before presenting to finance.",
        ],
        inputs: [
          "Churn assumptions by cohort",
          "New acquisition volume",
          "Expansion revenue expectations",
          "Pricing or packaging changes",
          "Seasonality or scenario toggles",
        ],
        outputs: [
          "Probabilistic revenue bands (p10, p50, p90)",
          "Scenario comparison dashboard",
          "Run-rate growth trajectory",
          "Variance and risk alerts",
        ],
        notes: [
          "Share outputs with the Board Scenarios tab for faster approvals.",
        ],
      },
    ],
  },
  {
    id: "profitability-margin",
    name: "Profitability & Margin",
    description: "Profitability tools for CFO and leadership reviews.",
    calculators: [
      {
        title: "Gross Margin & Unit Economics Calculator",
        summary: "Breaks down revenue, COGS, and contribution margin per unit or customer.",
        playbook: [
          "Analyze unit economics during quarterly business reviews.",
          "Validate margin impact from pricing or packaging experiments.",
        ],
        inputs: [
          "Revenue per unit or customer",
          "Cost of goods sold and delivery cost",
          "Variable versus fixed cost mix",
          "Utilization or capacity metrics",
          "Discount rate assumptions",
        ],
        outputs: [
          "Contribution margin per unit",
          "Breakeven volume",
          "Profit per customer",
          "Unit economics scorecard",
        ],
        notes: [
          "Combine with the Profit Margin Expansion model to quantify total EBITDA lift.",
        ],
      },
      {
        title: "Profit Margin Expansion Calculator",
        summary: "Shows how pricing, retention, and efficiency projects expand EBITDA or cash flow.",
        playbook: [
          "Stage multi-quarter margin expansion plans for leadership.",
          "Support capital allocation discussions with finance.",
        ],
        inputs: [
          "Baseline EBITDA or cash flow",
          "Pricing, churn, and efficiency improvement assumptions",
          "Operating expense structure",
          "Timeline for initiatives",
          "Required reinvestment or spend",
        ],
        outputs: [
          "Profit delta by lever",
          "Cumulative margin gain",
          "Reinvestment capacity",
          "EBITDA uplift by quarter",
        ],
        notes: [
          "Pair with Board Scenarios to highlight reinvestment options.",
        ],
      },
    ],
  },
  {
    id: "strategic-value",
    name: "Strategic Value",
    description: "Advisory-grade calculators for valuation and equity discussions.",
    calculators: [
      {
        title: "Company Valuation Impact Calculator",
        summary: "Shows how revenue or margin lift changes valuation and equity unlocked.",
        playbook: [
          "Use in strategic planning or capital raise prep meetings.",
          "Quantify equity unlocked for founders and investors.",
        ],
        inputs: [
          "ARR baseline",
          "EBITDA or margin profile",
          "Valuation multiple",
          "Target revenue or margin lift",
          "Ownership structure",
        ],
        outputs: [
          "Valuation delta",
          "Enterprise value growth",
          "Implied share price change",
          "Equity unlocked by stakeholder",
        ],
        notes: [
          "Layer on outputs from the Profit Margin Expansion model for board decks.",
        ],
      },
      {
        title: "Equity Share Calculator (TRS Deal Model)",
        summary: "Models equity-for-RevOS or performance fee structures for TRS engagements.",
        playbook: [
          "Structure shared-upside deals with founders or investors.",
          "Show ROI on advisory and delivery for equity negotiations.",
        ],
        inputs: [
          "Pre-money valuation",
          "Post-money valuation",
          "Equity percentage offered to TRS",
          "Expected revenue lift",
          "Vesting or performance triggers",
        ],
        outputs: [
          "TRS equity value",
          "ROI on advisory",
          "Dilution view",
          "Payback timeline",
          "Scenario waterfall",
        ],
        notes: [
          "Reference alongside the TRS ROI Calculator during deal reviews.",
        ],
      },
    ],
  },
  {
    id: "specialized-industry",
    name: "Specialized Industry",
    description: "Tailored calculators for SaaS, retail, services, subscription, and commerce clients.",
    calculators: [
      {
        title: "SaaS Metrics Dashboard Calculator",
        summary:
          "Provides an instant SaaS dashboard for MRR, NRR, Magic Number, and CAC payback.",
        playbook: [
          "Use during SaaS health reviews with revenue and product teams.",
          "Audit go-to-market efficiency for investor updates.",
        ],
        inputs: [
          "MRR and ARR by segment",
          "Sales and marketing spend",
          "Churn and expansion metrics",
          "Headcount productivity or bookings data",
        ],
        outputs: [
          "MRR and ARR growth trends",
          "Net revenue retention",
          "Magic Number",
          "CAC payback",
          "Efficiency benchmark comparison",
        ],
        notes: [
          "Publish snapshots into RevOS dashboards for executive visibility.",
        ],
      },
      {
        title: "Retail / eCommerce Profit Calculator",
        summary: "Optimizes AOV, conversion, and repeat rate to unlock profitable growth.",
        playbook: [
          "Plan merchandising or marketing mix shifts for retail brands.",
          "Tie acquisition spend to contribution margin in eCommerce reviews.",
        ],
        inputs: [
          "Average order value (AOV)",
          "Conversion rate",
          "Repeat purchase rate",
          "COGS per order",
          "Paid media spend and ROAS",
        ],
        outputs: [
          "Gross profit per order",
          "Break-even ROAS",
          "Customer lifetime value",
          "Inventory turn impact",
          "Contribution margin",
        ],
        notes: [
          "Feed recommendations into Shopify or ad platform experiments.",
        ],
      },
      {
        title: "Services Utilization Calculator",
        summary: "Diagnoses utilization, billable rate, and effective hourly ROI for services teams.",
        playbook: [
          "Spot under-utilized teams during professional services standups.",
          "Quantify the margin impact of utilization changes before hiring.",
        ],
        inputs: [
          "Billable rate by role",
          "Utilization percentage",
          "Cost per hour or salary load",
          "Bench capacity and project mix",
          "Delivery cost modifiers",
        ],
        outputs: [
          "Effective hourly ROI",
          "Revenue per consultant",
          "Capacity gaps",
          "Margin by role or pod",
        ],
        notes: [
          "Combine with Profit Margin Expansion to prioritize services investments.",
        ],
      },
      {
        title: "Subscription Churn & Expansion Simulator",
        summary: "Simulates retention and upsell dynamics for subscription businesses.",
        playbook: [
          "Model retention initiatives across self-serve and enterprise cohorts.",
          "Design upsell plays to increase expansion revenue.",
        ],
        inputs: [
          "Starting subscriber count",
          "Monthly churn rate",
          "Expansion or upsell rate",
          "Pricing tiers or plans",
          "New acquisition adds",
        ],
        outputs: [
          "Retention-driven growth curve",
          "Upsell revenue impact",
          "Subscriber forecast",
          "NRR improvement",
          "Cohort level insights",
        ],
        notes: [
          "Share with Success and Product Marketing to coordinate growth motions.",
        ],
      },
      {
        title: "Shopify Revenue Uplift Calculator",
        summary:
          "Measures pricing test impact and lifetime ROI for Shopify storefronts and the TRS app.",
        playbook: [
          "Plan Shopify pricing or bundling experiments with confidence.",
          "Show operators the lifetime ROI of experimentation programs.",
        ],
        inputs: [
          "Baseline Shopify revenue",
          "Average order value",
          "Test cohort size or traffic",
          "Pricing test uplift percentage",
          "Customer lifetime value",
        ],
        outputs: [
          "Incremental revenue per test",
          "Lifetime ROI",
          "Payback on discounting or incentives",
          "Merchandising recommendation set",
          "Channel sensitivity analysis",
        ],
        notes: [
          "Export insights directly into Shopify or campaign planning workspaces.",
        ],
      },
    ],
  },
  {
    id: "advisory-layer",
    name: "Advisory Layer",
    description: "Optional advisory dashboards for RevBoard installs and partner discussions.",
    calculators: [
      {
        title: "Cash Flow Simulator",
        summary: "Shows how improvements change runway, hiring capacity, and reinvestment pace.",
        playbook: [
          "Share updated runway views with finance and founders.",
          "Model headcount, vendor, and capital strategy trade-offs.",
        ],
        inputs: [
          "Starting cash balance",
          "Monthly burn and expense drivers",
          "Revenue uplift scenarios",
          "Hiring plan and timing",
          "Capital injections or debt facilities",
        ],
        outputs: [
          "Runway impact",
          "Cash break-even date",
          "Reinvestment capacity",
          "Operating cash needs",
          "Board-ready update snapshots",
        ],
        notes: [
          "Connect to the Compounding ROI Dashboard to visualize wealth creation.",
        ],
      },
      {
        title: "Compounding ROI Dashboard",
        summary: "Visualizes multi-year wealth creation across pricing, retention, and efficiency plays.",
        playbook: [
          "Support investor or partner discussions with a cohesive narrative.",
          "Reinforce why RevOS interventions should stay active post-engagement.",
        ],
        inputs: [
          "Multi-year revenue forecast",
          "Margin assumptions",
          "Investment schedule",
          "Retention and pricing uplift data",
          "Equity or profit-sharing splits",
        ],
        outputs: [
          "Wealth creation timeline",
          "Cumulative ROI across interventions",
          "Shareholder distribution",
          "Scenario overlays",
          "Executive-ready visual package",
        ],
        notes: [
          "Use after presenting Cash Flow Simulator results to extend the story arc.",
        ],
      },
    ],
  },
];

