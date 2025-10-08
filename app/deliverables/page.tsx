import Link from 'next/link'

export default function Deliverables() {
  const items = [
    { id: '1', type: 'CLARITY_AUDIT', status: 'APPROVED', owner: 'Principal', due: '—' },
    { id: '2', type: 'GAP_MAP', status: 'IN_REVIEW', owner: 'Analyst', due: '2025-10-15' },
    { id: '3', type: 'INTERVENTION_BLUEPRINT', status: 'DRAFT', owner: 'Operator', due: '2025-10-22' },
  ]
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Deliverables</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">Type</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Owner</th>
            <th className="text-left p-2">Due</th>
            <th className="text-left p-2">Export</th>
          </tr>
        </thead>
        <tbody>
          {items.map(x => (
            <tr key={x.id} className="border-t">
              <td className="p-2">{x.type}</td>
              <td className="p-2">{x.status}</td>
              <td className="p-2">{x.owner}</td>
              <td className="p-2">{x.due}</td>
              <td className="p-2"><Link href={`/api/deliverables/${x.id}/export`} className="underline">export</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
