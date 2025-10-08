export default function Governance() {
  const requirements = [
    { key: 'ROI_HYPOTHESIS', status: 'SATISFIED' },
    { key: 'QA_CHECKLIST', status: 'PENDING' },
    { key: 'OWNER_ASSIGNED', status: 'SATISFIED' },
    { key: 'PAYBACK_WINDOW', status: 'SATISFIED' },
    { key: 'TRS_SCORE_LEVER', status: 'SATISFIED' },
  ]
  const blocked = requirements.some(r => r.status !== 'SATISFIED')
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Governance Gate</h2>
      <div className={"rounded p-3 text-sm " + (blocked ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
        {blocked ? "Activation BLOCKED: unmet requirements" : "Activation allowed"}
      </div>
      <ul className="text-sm list-disc pl-6">
        {requirements.map(r => <li key={r.key}><span className="font-medium">{r.key}</span>: {r.status}</li>)}
      </ul>
    </div>
  )
}
