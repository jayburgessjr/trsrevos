export default function Partner() {
  const partners = [
    { name: 'MSP A', overlap: 8, influence: 7, pipeline: 150000 },
    { name: 'RevOps Guild', overlap: 6, influence: 9, pipeline: 220000 },
  ]
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Partner & Channel Scout</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-50"><tr><th className="p-2 text-left">Partner</th><th className="p-2 text-left">Overlap</th><th className="p-2 text-left">Influence</th><th className="p-2 text-left">Expected Pipeline</th><th className="p-2"></th></tr></thead>
        <tbody>
          {partners.map(p => (
            <tr key={p.name} className="border-t">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.overlap}</td>
              <td className="p-2">{p.influence}</td>
              <td className="p-2">${"{:,}".format(p.pipeline)}</td>
              <td className="p-2"><button className="underline">Draft rev-share</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
