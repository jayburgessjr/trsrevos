"use client"

type KPI = { label: string; value: string }

export function KpiStrip({ items }: { items: KPI[] }) {
  if (!items.length) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
      {items.map((kpi, index) => (
        <div
          key={`${kpi.label}-${index}`}
          className="rounded-xl border border-gray-200 bg-white p-3"
        >
          <div className="text-[11px] text-gray-500">{kpi.label}</div>
          <div className="mt-1 text-xl font-semibold text-black">{kpi.value}</div>
        </div>
      ))}
    </div>
  )
}
