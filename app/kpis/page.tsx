export default function KPIs() {
  const bands = [
    { band: 'RED', range: '< 60', playbook: 'Stabilization' },
    { band: 'YELLOW', range: '60–69', playbook: 'Incremental' },
    { band: 'GREEN', range: '≥ 70', playbook: 'Brilliant' },
  ]
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">KPIs & Alerts</h2>
      <table className="text-sm border">
        <thead className="bg-gray-50"><tr><th className="p-2 text-left">Band</th><th className="p-2 text-left">Score</th><th className="p-2 text-left">Default Playbook</th></tr></thead>
        <tbody>
          {bands.map(b => (
            <tr key={b.band} className="border-t">
              <td className="p-2">{b.band}</td>
              <td className="p-2">{b.range}</td>
              <td className="p-2">{b.playbook}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
