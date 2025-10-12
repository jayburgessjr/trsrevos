export type QRAInputs = {
  quant?: Record<string, unknown>;
  qual?: Record<string, unknown>;
};

export type StrategyPlay = {
  id: string;
  title: string;
  description: string;
  ownerHint: string;
  dueInDays: number;
};

export type StrategyChecklistItem = {
  id: string;
  label: string;
  ownerHint?: string;
  dueInDays?: number;
};

export type StrategyMetric = {
  label: string;
  baseline: string;
  target: string;
};

export type StrategyBody = {
  key: 'speed' | 'price' | 'scale';
  title: string;
  narrative: string;
  plays: StrategyPlay[];
  checklist: StrategyChecklistItem[];
  metrics: StrategyMetric[];
};

export type StrategyVariant = {
  key: 'speed' | 'price' | 'scale';
  title: string;
  headline: string;
  body: StrategyBody;
};

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

function resolveNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function resolvePercent(value: unknown, fallback: number) {
  const numeric = resolveNumber(value, fallback);
  return Math.max(0, Math.min(100, numeric));
}

export function computeStrategies(inputs: QRAInputs): StrategyVariant[] {
  const quant = inputs.quant ?? {};
  const qual = inputs.qual ?? {};

  const arr = resolveNumber(quant.arr, 0);
  const growthRate = resolvePercent(quant.growth_rate ?? quant.growthRate, 12);
  const churnRate = resolvePercent(quant.churn_rate ?? quant.churnRate, 6);
  const salesCycle = resolveNumber(quant.sales_cycle_days ?? quant.salesCycleDays, 45);
  const winRate = resolvePercent(quant.win_rate ?? quant.winRate, 28);
  const acv = resolveNumber(quant.acv, arr > 0 ? arr / 12 : 40000);

  const primaryGoal = typeof qual.primary_goal === 'string' ? qual.primary_goal : 'Accelerate revenue compounding';
  const champion = typeof qual.champion === 'string' ? qual.champion : 'Client Operator';

  const makePlayId = (key: string, index: number) => `${key}-play-${index + 1}`;
  const makeChecklistId = (key: string, index: number) => `${key}-check-${index + 1}`;

  const speedLift = Math.round(Math.max(8, 0.5 * winRate + 0.25 * (100 - churnRate)));
  const priceLift = Math.round(Math.max(6, 0.4 * (100 - winRate) + 0.3 * (100 - churnRate)));
  const scaleLift = Math.round(Math.max(10, 0.6 * growthRate + 0.2 * winRate));

  const pipelineCoverage = Math.max(3, Math.round((100 - winRate) / 10));
  const expectedARRSpeed = arr + (arr * speedLift) / 100;
  const expectedARRPrice = arr + (arr * priceLift) / 100;
  const expectedARRScale = arr + (arr * scaleLift) / 100;

  const playsFor = (key: 'speed' | 'price' | 'scale'): StrategyPlay[] => {
    switch (key) {
      case 'speed':
        return [
          {
            id: makePlayId(key, 0),
            title: 'Compress sales cycle by 20%',
            description: 'Deploy automated discovery briefs and live mutual action plans to remove stalls.',
            ownerHint: 'Revenue Ops',
            dueInDays: Math.max(21, Math.round(salesCycle / 2)),
          },
          {
            id: makePlayId(key, 1),
            title: 'Instrument decision committee proof',
            description: 'Launch buyer enablement workspace and assign exec sponsor for every deal >$50k ACV.',
            ownerHint: 'Client Champion',
            dueInDays: 28,
          },
          {
            id: makePlayId(key, 2),
            title: 'Rebuild pipeline forecast hygiene',
            description: 'Stand up weekly forecast readouts with stage exit criteria and call scoring.',
            ownerHint: 'Sales Leadership',
            dueInDays: 35,
          },
        ];
      case 'price':
        return [
          {
            id: makePlayId(key, 0),
            title: 'Package outcome-based tiers',
            description: 'Bundle adoption accelerators with premium support to justify 12% uplift.',
            ownerHint: 'Product Marketing',
            dueInDays: 30,
          },
          {
            id: makePlayId(key, 1),
            title: 'Launch value review rhythm',
            description: 'Introduce quarterly business reviews with benchmarks to surface expansion triggers.',
            ownerHint: 'Account Management',
            dueInDays: 45,
          },
          {
            id: makePlayId(key, 2),
            title: 'Refine discount guardrails',
            description: 'Implement deal desk approvals with floor pricing tied to margin targets.',
            ownerHint: 'Finance Lead',
            dueInDays: 32,
          },
        ];
      case 'scale':
      default:
        return [
          {
            id: makePlayId(key, 0),
            title: 'Stand up partner acquisition lane',
            description: 'Activate top channel partners with co-selling kits and joint pipeline goals.',
            ownerHint: 'Partnerships',
            dueInDays: 60,
          },
          {
            id: makePlayId(key, 1),
            title: 'Expand coverage with pods',
            description: 'Spin up an outbound pod focused on Tier 1 accounts with programmatic intent data.',
            ownerHint: 'Growth Lead',
            dueInDays: 50,
          },
          {
            id: makePlayId(key, 2),
            title: 'Operationalize product telemetry',
            description: 'Wire product usage signals into CRM to prioritize expansion plays.',
            ownerHint: 'Data Engineering',
            dueInDays: 42,
          },
        ];
    }
  };

  const checklistFor = (key: 'speed' | 'price' | 'scale'): StrategyChecklistItem[] =>
    playsFor(key).map((play, index) => ({
      id: makeChecklistId(key, index),
      label: play.title,
      ownerHint: play.ownerHint,
      dueInDays: play.dueInDays,
    }));

  const metricsFor = (
    key: 'speed' | 'price' | 'scale',
    targetArr: number
  ): StrategyMetric[] => {
    switch (key) {
      case 'speed':
        return [
          {
            label: 'Sales Cycle (days)',
            baseline: `${Math.round(salesCycle)} days`,
            target: `${Math.round(salesCycle * 0.8)} days`,
          },
          {
            label: 'Win Rate',
            baseline: `${winRate}%`,
            target: `${Math.min(70, winRate + 8)}%`,
          },
          {
            label: 'ARR Run-Rate',
            baseline: formatCurrency(arr),
            target: formatCurrency(targetArr),
          },
        ];
      case 'price':
        return [
          {
            label: 'Average Contract Value',
            baseline: formatCurrency(acv),
            target: formatCurrency(acv * 1.12),
          },
          {
            label: 'Discount Rate',
            baseline: `${Math.max(0, 25 - winRate / 2).toFixed(1)}%`,
            target: `${Math.max(0, 15 - winRate / 3).toFixed(1)}%`,
          },
          {
            label: 'ARR Run-Rate',
            baseline: formatCurrency(arr),
            target: formatCurrency(targetArr),
          },
        ];
      case 'scale':
      default:
        return [
          {
            label: 'Pipeline Coverage',
            baseline: `${pipelineCoverage}x`,
            target: `${pipelineCoverage + 1}x`,
          },
          {
            label: 'Net Expansion',
            baseline: `${Math.max(0, 100 - churnRate)}%`,
            target: `${Math.min(140, 110 - churnRate / 2)}%`,
          },
          {
            label: 'ARR Run-Rate',
            baseline: formatCurrency(arr),
            target: formatCurrency(targetArr),
          },
        ];
    }
  };

  const headlineFor = (key: 'speed' | 'price' | 'scale', lift: number) => {
    switch (key) {
      case 'speed':
        return `Accelerate revenue velocity by ${lift}% through tighter motion design`;
      case 'price':
        return `Monetize value moments to unlock ${lift}% more ARR per customer`;
      case 'scale':
      default:
        return `Expand coverage lanes to generate ${lift}% growth with durable execution`;
    }
  };

  const narrativeFor = (key: 'speed' | 'price' | 'scale'): string => {
    switch (key) {
      case 'speed':
        return `${primaryGoal} with a focus on compressing the ${salesCycle}-day cycle and arming ${champion} with real-time insights.`;
      case 'price':
        return `Shift the monetization story to value realized, pairing stronger packaging with governance that protects margins.`;
      case 'scale':
      default:
        return `Activate new growth lanes by combining partner leverage with instrumented expansion signals across the account base.`;
    }
  };

  const variants: StrategyVariant[] = [
    {
      key: 'speed',
      title: 'Velocity Blueprint',
      headline: headlineFor('speed', speedLift),
      body: {
        key: 'speed',
        title: 'Velocity Blueprint',
        narrative: narrativeFor('speed'),
        plays: playsFor('speed'),
        checklist: checklistFor('speed'),
        metrics: metricsFor('speed', expectedARRSpeed),
      },
    },
    {
      key: 'price',
      title: 'Monetization Upgrade',
      headline: headlineFor('price', priceLift),
      body: {
        key: 'price',
        title: 'Monetization Upgrade',
        narrative: narrativeFor('price'),
        plays: playsFor('price'),
        checklist: checklistFor('price'),
        metrics: metricsFor('price', expectedARRPrice),
      },
    },
    {
      key: 'scale',
      title: 'Scale Engine',
      headline: headlineFor('scale', scaleLift),
      body: {
        key: 'scale',
        title: 'Scale Engine',
        narrative: narrativeFor('scale'),
        plays: playsFor('scale'),
        checklist: checklistFor('scale'),
        metrics: metricsFor('scale', expectedARRScale),
      },
    },
  ];

  return variants;
}
