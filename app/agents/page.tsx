export default function Agents() {
  const agents = [
    { key: 'ATLAS', name: 'Atlas / BlueprintEngine', kpi: 'Margin Uplift' },
    { key: 'FORECAST_IQ', name: 'ForecastIQ', kpi: 'Forecast MAPE' },
    { key: 'EXECUTION_OPS', name: 'ExecutionOps', kpi: 'Velocity' },
    { key: 'SIGNAL_SENTINEL', name: 'SignalSentinel', kpi: 'Anomaly Detection' },
    { key: 'CASE_COMPILER', name: 'CaseCompiler', kpi: 'Case Studies' },
    { key: 'REVENUE_ADVISOR', name: 'RevenueAdvisor', kpi: 'What-if Impact' },
  ]
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Agents</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {agents.map(a => (
          <div key={a.key} className="border rounded p-3 text-sm bg-white">
            <div className="font-medium">{a.name}</div>
            <div className="text-gray-700">Owns KPI: {a.kpi}</div>
            <div className="mt-2 text-xs text-gray-500">Prompts / inputs / outputs and SOPs live in /docs and /app/api/agents</div>
          </div>
        ))}
      </div>
    </div>
  )
}
