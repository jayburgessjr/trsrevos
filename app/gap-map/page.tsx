export default function GapMap() {
  const gaps = [
    { id: 1, title: 'Raise ASP by 6%', tier: 1, impact: 180000 },
    { id: 2, title: 'Activate win-back flow', tier: 2, impact: 65000 },
    { id: 3, title: 'Cut low-ROI ads', tier: 1, impact: 120000 },
  ]
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Gap Map</h2>
      <div className="text-sm text-gray-700">Tier 1: &lt;45-day ROI, Tier 2, Tier 3 • Dollarized impacts</div>
      <ul className="divide-y border rounded bg-white">
        {gaps.map(g => (
          <li key={g.id} className="p-3 text-sm flex items-center justify-between">
            <div>
              <div className="font-medium">{g.title}</div>
              <div className="text-gray-500">Tier {g.tier} • Impact ${g.impact.toLocaleString()}</div>
            </div>
            <button className="rounded px-3 py-1 border bg-gray-50 hover:bg-gray-100">Add to Blueprint</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
