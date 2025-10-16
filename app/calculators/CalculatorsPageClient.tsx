'use client'

import { useState } from 'react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'

type CalculatorType =
  | 'audit-roi'
  | 'pricing-scenario'
  | 'activation-funnel'
  | 'retention-ltv'
  | 'cac-payback'
  | 'offer-roi'
  | 'revenue-planner'
  | 'volume-targets'
  | 'revenueos-recognition'
  | 'compensation'

type CalculatorCategory = 'client-facing' | 'internal'

const calculators: Array<{
  id: CalculatorType
  name: string
  category: CalculatorCategory
  description: string
  stages: string
  icon: string
}> = [
  {
    id: 'audit-roi',
    name: 'Audit ROI Quick Estimator',
    category: 'client-facing',
    description: 'Prove the $3,500 audit pays for itself fast',
    stages: 'Stage 1, 6',
    icon: '💰'
  },
  {
    id: 'pricing-scenario',
    name: 'Pricing Scenario / Elasticity',
    category: 'client-facing',
    description: 'Find defensible "sweet spot" price before tests',
    stages: 'Stage 3, 4, 6',
    icon: '💲'
  },
  {
    id: 'activation-funnel',
    name: 'Activation Funnel Impact',
    category: 'client-facing',
    description: 'Dollarize improving trial→active or lead→qualified',
    stages: 'Stage 3-5',
    icon: '🎯'
  },
  {
    id: 'retention-ltv',
    name: 'Retention / LTV / NRR',
    category: 'client-facing',
    description: 'Show value of cutting churn or adding expansion',
    stages: 'Stage 4-6',
    icon: '📈'
  },
  {
    id: 'cac-payback',
    name: 'CAC Payback & Unit Econ',
    category: 'client-facing',
    description: 'Decide if pricing/activation changes fix payback',
    stages: 'Stage 5-6',
    icon: '⚖️'
  },
  {
    id: 'offer-roi',
    name: 'Offer ROI Calculator',
    category: 'client-facing',
    description: 'Justify recommended package with math',
    stages: 'Stage 6',
    icon: '🎁'
  },
  {
    id: 'revenue-planner',
    name: 'TRS Revenue Planner',
    category: 'internal',
    description: 'Convert volumes and attach rates into gross, then waterfall to ops/marketing/salaries',
    stages: 'Stage 7, Weekly Ops',
    icon: '📊'
  },
  {
    id: 'volume-targets',
    name: 'Volume Targets (Reverse)',
    category: 'internal',
    description: 'How many audits needed to hit $X gross or net?',
    stages: 'Weekly Ops',
    icon: '🎲'
  },
  {
    id: 'revenueos-recognition',
    name: 'RevenueOS Recognition',
    category: 'internal',
    description: 'Smooth enterprise ACV across milestones for forecasting',
    stages: 'Pipeline & Cash Planning',
    icon: '📅'
  },
  {
    id: 'compensation',
    name: 'Compensation & Distributions',
    category: 'internal',
    description: 'Jay/Gabe salaries, burden, tax, reinvestments, distributions',
    stages: 'Owner Pay, Planning',
    icon: '💵'
  }
]

export default function CalculatorsPageClient() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType | null>(null)
  const [category, setCategory] = useState<CalculatorCategory | 'all'>('all')

  const filteredCalculators = calculators.filter(
    (calc) => category === 'all' || calc.category === category
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue Calculators</h1>
          <p className="mt-1 text-sm text-slate-600">
            Client-facing and internal calculators for revenue science
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={category === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategory('all')}
          >
            All
          </Badge>
          <Badge
            variant={category === 'client-facing' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategory('client-facing')}
          >
            Client-Facing
          </Badge>
          <Badge
            variant={category === 'internal' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategory('internal')}
          >
            Internal
          </Badge>
        </div>
      </div>

      {/* Calculator Grid */}
      {!activeCalculator ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCalculators.map((calc) => (
            <Card
              key={calc.id}
              className="cursor-pointer border-slate-200 transition-all hover:shadow-md hover:border-blue-300"
              onClick={() => setActiveCalculator(calc.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{calc.icon}</span>
                  <Badge
                    variant="outline"
                    className={
                      calc.category === 'client-facing'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-blue-500 text-blue-600'
                    }
                  >
                    {calc.category === 'client-facing' ? 'Client' : 'Internal'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{calc.name}</CardTitle>
                <CardDescription>{calc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-slate-500">
                  <span className="font-medium">Used in:</span> {calc.stages}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <Button
            variant="outline"
            onClick={() => setActiveCalculator(null)}
            className="mb-4"
          >
            ← Back to All Calculators
          </Button>
          {activeCalculator === 'audit-roi' && <AuditROICalculator />}
          {activeCalculator === 'pricing-scenario' && <PricingScenarioCalculator />}
          {activeCalculator === 'activation-funnel' && <ActivationFunnelCalculator />}
          {activeCalculator === 'retention-ltv' && <RetentionLTVCalculator />}
          {activeCalculator === 'cac-payback' && <CACPaybackCalculator />}
          {activeCalculator === 'offer-roi' && <OfferROICalculator />}
          {activeCalculator === 'revenue-planner' && <RevenuePlannerCalculator />}
          {activeCalculator === 'volume-targets' && <VolumeTargetsCalculator />}
          {activeCalculator === 'revenueos-recognition' && <RevenueOSRecognitionCalculator />}
          {activeCalculator === 'compensation' && <CompensationCalculator />}
        </div>
      )}
    </div>
  )
}

// A1. Audit ROI Quick Estimator
function AuditROICalculator() {
  const [inputs, setInputs] = useState({
    arpa: 500,
    monthlyLeads: 1000,
    currentClose: 2.5,
    currentChurn: 5,
    traffic: 5000,
    grossMargin: 70,
    priceIncrease: 8,
    activationIncrease: 5,
    churnReduction: 2,
    auditCost: 3500,
    elasticity: -0.7
  })

  const [results, setResults] = useState<any>(null)

  const calculate = () => {
    // Price uplift
    const deltaP = inputs.priceIncrease / 100
    const priceUplift = inputs.monthlyLeads * (inputs.currentClose / 100) * inputs.arpa * deltaP * (1 + inputs.elasticity * deltaP)

    // Activation uplift
    const newConv = (inputs.currentClose + inputs.activationIncrease) / 100
    const baseConv = inputs.currentClose / 100
    const activationUplift = inputs.traffic * (newConv - baseConv) * inputs.arpa

    // Churn uplift (monthly impact)
    const churnNew = (inputs.currentChurn - inputs.churnReduction) / 100
    const churnBase = inputs.currentChurn / 100
    const deltaLTV = inputs.arpa * (inputs.grossMargin / 100) * (1 / churnNew - 1 / churnBase)
    const monthlyChurnUplift = (inputs.monthlyLeads * (inputs.currentClose / 100)) * deltaLTV / 12

    const totalMonthlyUplift = priceUplift + activationUplift + monthlyChurnUplift
    const paybackDays = (inputs.auditCost / totalMonthlyUplift) * 30
    const roi90Days = ((totalMonthlyUplift * 3) - inputs.auditCost) / inputs.auditCost

    setResults({
      priceUplift: Math.round(priceUplift),
      activationUplift: Math.round(activationUplift),
      churnUplift: Math.round(monthlyChurnUplift),
      totalMonthlyUplift: Math.round(totalMonthlyUplift),
      paybackDays: Math.round(paybackDays),
      roi90Days: roi90Days.toFixed(2)
    })
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <div>
            <CardTitle>Audit ROI Quick Estimator</CardTitle>
            <CardDescription>Prove the $3,500 audit pays for itself fast</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Inputs</h3>

            <div className="space-y-2">
              <Label>ARPA/ASP ($)</Label>
              <Input
                type="number"
                value={inputs.arpa}
                onChange={(e) => setInputs({ ...inputs, arpa: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Monthly Leads</Label>
              <Input
                type="number"
                value={inputs.monthlyLeads}
                onChange={(e) => setInputs({ ...inputs, monthlyLeads: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Current Close % </Label>
              <Input
                type="number"
                step="0.1"
                value={inputs.currentClose}
                onChange={(e) => setInputs({ ...inputs, currentClose: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Current Churn % (monthly)</Label>
              <Input
                type="number"
                step="0.1"
                value={inputs.currentChurn}
                onChange={(e) => setInputs({ ...inputs, currentChurn: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Traffic/Lead Volume</Label>
              <Input
                type="number"
                value={inputs.traffic}
                onChange={(e) => setInputs({ ...inputs, traffic: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Gross Margin %</Label>
              <Input
                type="number"
                value={inputs.grossMargin}
                onChange={(e) => setInputs({ ...inputs, grossMargin: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Proposed Price Increase %</Label>
              <Input
                type="number"
                step="0.1"
                value={inputs.priceIncrease}
                onChange={(e) => setInputs({ ...inputs, priceIncrease: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Proposed Activation Increase (pp)</Label>
              <Input
                type="number"
                step="0.1"
                value={inputs.activationIncrease}
                onChange={(e) => setInputs({ ...inputs, activationIncrease: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Proposed Churn Reduction (pp)</Label>
              <Input
                type="number"
                step="0.1"
                value={inputs.churnReduction}
                onChange={(e) => setInputs({ ...inputs, churnReduction: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Audit Cost ($)</Label>
              <Input
                type="number"
                value={inputs.auditCost}
                onChange={(e) => setInputs({ ...inputs, auditCost: Number(e.target.value) })}
              />
            </div>

            <Button onClick={calculate} className="w-full">
              Calculate ROI
            </Button>
          </div>

          {/* Results */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Results</h3>
            {results ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Price Uplift
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-900">
                    ${results.priceUplift.toLocaleString()}/mo
                  </p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Activation Uplift
                  </p>
                  <p className="mt-1 text-2xl font-bold text-blue-900">
                    ${results.activationUplift.toLocaleString()}/mo
                  </p>
                </div>

                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
                    Churn Uplift
                  </p>
                  <p className="mt-1 text-2xl font-bold text-purple-900">
                    ${results.churnUplift.toLocaleString()}/mo
                  </p>
                </div>

                <div className="rounded-lg border border-slate-300 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Total Monthly Uplift
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    ${results.totalMonthlyUplift.toLocaleString()}/mo
                  </p>
                </div>

                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                    Payback Period
                  </p>
                  <p className="mt-1 text-2xl font-bold text-orange-900">
                    {results.paybackDays} days
                  </p>
                </div>

                <div className="rounded-lg border border-green-300 bg-green-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    90-Day ROI Multiple
                  </p>
                  <p className="mt-1 text-2xl font-bold text-green-900">
                    {results.roi90Days}x
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                <p>Enter inputs and click Calculate ROI</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Placeholder components for other calculators
function PricingScenarioCalculator() {
  return <CalculatorPlaceholder name="Pricing Scenario / Elasticity" icon="💲" />
}

function ActivationFunnelCalculator() {
  return <CalculatorPlaceholder name="Activation Funnel Impact" icon="🎯" />
}

function RetentionLTVCalculator() {
  return <CalculatorPlaceholder name="Retention / LTV / NRR" icon="📈" />
}

function CACPaybackCalculator() {
  return <CalculatorPlaceholder name="CAC Payback & Unit Econ" icon="⚖️" />
}

function OfferROICalculator() {
  return <CalculatorPlaceholder name="Offer ROI Calculator" icon="🎁" />
}

function RevenuePlannerCalculator() {
  return <CalculatorPlaceholder name="TRS Revenue Planner" icon="📊" />
}

function VolumeTargetsCalculator() {
  return <CalculatorPlaceholder name="Volume Targets (Reverse)" icon="🎲" />
}

function RevenueOSRecognitionCalculator() {
  return <CalculatorPlaceholder name="RevenueOS Recognition" icon="📅" />
}

function CompensationCalculator() {
  return <CalculatorPlaceholder name="Compensation & Distributions" icon="💵" />
}

function CalculatorPlaceholder({ name, icon }: { name: string; icon: string }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Calculator implementation in progress</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-sm text-slate-500">
          <div className="text-center">
            <p className="font-medium">Coming Soon</p>
            <p className="mt-1 text-xs">This calculator will be implemented next</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
