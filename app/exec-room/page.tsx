export default function ExecRoom() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Executive Room (RevBoard)</h2>
      <p className="text-sm text-gray-700">Export weekly deck with baselines, deltas, TRS Score trend, anomalies, decisions, and ROI table.</p>
      <form action="/api/exec-room/export">
        <button className="rounded px-3 py-1 border bg-gray-50 hover:bg-gray-100">Export to Deck</button>
      </form>
    </div>
  )
}
