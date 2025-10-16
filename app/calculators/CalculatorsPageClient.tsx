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
}> = [
  {
    id: 'audit-roi',
    name: 'Audit ROI Quick Estimator',
    category: 'client-facing',
    description: 'Prove the $3,500 audit pays for itself fast',
    stages: 'Stage 1, 6',
  },
  {
    id: 'pricing-scenario',
    name: 'Pricing Scenario / Elasticity',
    category: 'client-facing',
    description: 'Find defensible "sweet spot" price before tests',
    stages: 'Stage 3, 4, 6',
  },
  {
    id: 'activation-funnel',
    name: 'Activation Funnel Impact',
    category: 'client-facing',
    description: 'Dollarize improving trial→active or lead→qualified',
    stages: 'Stage 3-5',
  },
  {
    id: 'retention-ltv',
    name: 'Retention / LTV / NRR',
    category: 'client-facing',
    description: 'Show value of cutting churn or adding expansion',
    stages: 'Stage 4-6',
  },
  {
    id: 'cac-payback',
    name: 'CAC Payback & Unit Econ',
    category: 'client-facing',
    description: 'Decide if pricing/activation changes fix payback',
    stages: 'Stage 5-6',
  },
  {
    id: 'offer-roi',
    name: 'Offer ROI Calculator',
    category: 'client-facing',
    description: 'Justify recommended package with math',
    stages: 'Stage 6',
  },
  {
    id: 'revenue-planner',
    name: 'TRS Revenue Planner',
    category: 'internal',
    description: 'Convert volumes and attach rates into gross, then waterfall to ops/marketing/salaries',
    stages: 'Stage 7, Weekly Ops',
  },
  {
    id: 'volume-targets',
    name: 'Volume Targets (Reverse)',
    category: 'internal',
    description: 'How many audits needed to hit $X gross or net?',
    stages: 'Weekly Ops',
  },
  {
    id: 'revenueos-recognition',
    name: 'RevenueOS Recognition',
    category: 'internal',
    description: 'Smooth enterprise ACV across milestones for forecasting',
    stages: 'Pipeline & Cash Planning',
  },
  {
    id: 'compensation',
    name: 'Compensation & Distributions',
    category: 'internal',
    description: 'Jay/Gabe salaries, burden, tax, reinvestments, distributions',
    stages: 'Owner Pay, Planning',
  }
]

export default function CalculatorsPageClient() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType | null>(null)
  const [category, setCategory] = useState<CalculatorCategory | 'all'>('all')

  const filteredCalculators = calculators.filter(
    (calc) => category === 'all' || calc.category === category
  )

  return (
    <div className="space-y-8">
      {!activeCalculator ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-slate-200 lg:col-span-2">
            <CardHeader className="border-b border-slate-200/60 pb-4">
              <CardTitle className="text-lg font-semibold">Revenue Calculators</CardTitle>
              <CardDescription>Client-facing and internal calculators for revenue science</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
              {filteredCalculators.map((calc) => (
                <div
                  key={calc.id}
                  className="flex cursor-pointer flex-col rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                  onClick={() => setActiveCalculator(calc.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{calc.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">{calc.category}</p>
                    </div>
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
                  <p className="mt-2 text-sm text-slate-600">{calc.description}</p>
                  <div className="mt-2 text-xs text-slate-500">
                    <span className="font-medium">Used in:</span> {calc.stages}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-200/60 pb-4">
              <CardTitle className="text-lg font-semibold">Category Filter</CardTitle>
              <CardDescription>Filter calculators by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  category === 'all'
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onClick={() => setCategory('all')}
              >
                <p className="text-sm font-medium text-slate-900">All Calculators</p>
                <p className="mt-1 text-xs text-slate-600">{calculators.length} calculators</p>
              </div>

              <div
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  category === 'client-facing'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onClick={() => setCategory('client-facing')}
              >
                <p className="text-sm font-medium text-slate-900">Client-Facing</p>
                <p className="mt-1 text-xs text-slate-600">
                  {calculators.filter((c) => c.category === 'client-facing').length} calculators
                </p>
              </div>

              <div
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  category === 'internal'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onClick={() => setCategory('internal')}
              >
                <p className="text-sm font-medium text-slate-900">Internal TRS</p>
                <p className="mt-1 text-xs text-slate-600">
                  {calculators.filter((c) => c.category === 'internal').length} calculators
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
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
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="border-slate-200 lg:col-span-2">
        <CardHeader className="border-b border-slate-200/60 pb-4">
          <CardTitle className="text-lg font-semibold">Audit ROI Quick Estimator</CardTitle>
          <CardDescription>Prove the $3,500 audit pays for itself fast</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
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
            <Label>Current Close %</Label>
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
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200/60 pb-4">
          <CardTitle className="text-lg font-semibold">Results</CardTitle>
          <CardDescription>Calculate to see ROI breakdown</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {results ? (
            <>
              <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500">Price Uplift</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  ${results.priceUplift.toLocaleString()}/mo
                </p>
              </div>

              <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500">Activation Uplift</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  ${results.activationUplift.toLocaleString()}/mo
                </p>
              </div>

              <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500">Churn Uplift</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  ${results.churnUplift.toLocaleString()}/mo
                </p>
              </div>

              <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500">Total Monthly Uplift</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  ${results.totalMonthlyUplift.toLocaleString()}/mo
                </p>
              </div>

              <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500">Payback Period</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {results.paybackDays} days
                </p>
              </div>

              <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500">90-Day ROI Multiple</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {results.roi90Days}x
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center py-12 text-sm text-slate-500">
              <p>Enter inputs and click Calculate ROI</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

// Placeholder components for other calculators
function PricingScenarioCalculator() {
  return <CalculatorPlaceholder name="Pricing Scenario / Elasticity" />
}

function ActivationFunnelCalculator() {
  return <CalculatorPlaceholder name="Activation Funnel Impact" />
}

function RetentionLTVCalculator() {
  return <CalculatorPlaceholder name="Retention / LTV / NRR" />
}

function CACPaybackCalculator() {
  return <CalculatorPlaceholder name="CAC Payback & Unit Econ" />
}

function OfferROICalculator() {
  return <CalculatorPlaceholder name="Offer ROI Calculator" />
}

function RevenuePlannerCalculator() {
  return <CalculatorPlaceholder name="TRS Revenue Planner" />
}

function VolumeTargetsCalculator() {
  return <CalculatorPlaceholder name="Volume Targets (Reverse)" />
}

function RevenueOSRecognitionCalculator() {
  return <CalculatorPlaceholder name="RevenueOS Recognition" />
}

function CompensationCalculator() {
  return <CalculatorPlaceholder name="Compensation & Distributions" />
}

function CalculatorPlaceholder({ name }: { name: string }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="border-b border-slate-200/60">
        <CardTitle>{name}</CardTitle>
        <CardDescription>Calculator implementation in progress</CardDescription>
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
