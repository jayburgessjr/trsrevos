// app/dashboard/page.tsx
import { listClientOverview, getPipelineForecast } from "@/lib/queries";

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-black">{value}</div>
    </div>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-3 py-2 text-left text-gray-600 text-[12px]">{children}</th>
);
const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="px-3 py-2">{children}</td>
);

export default async function DashboardPage() {
  const [clients, forecast] = await Promise.all([
    listClientOverview(),
    getPipelineForecast(),
  ]);

  const totalMRR = clients.reduce((s, c) => s + (c.mrr ?? 0), 0);
  const totalAR = clients.reduce((s, c) => s + (c.ar_outstanding ?? 0), 0);
  const weighted = forecast.length ? (forecast[0].all_weighted_value ?? 0) : 0;

  return (
    <div className="w-full min-h-screen bg-white text-black">
      {/* Top masthead is assumed to be part of your layout; keep page content simple */}
      <div className="p-4">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Kpi label="Total MRR" value={`$${totalMRR.toLocaleString()}`} />
          <Kpi label="A/R Outstanding" value={`$${totalAR.toLocaleString()}`} />
          <Kpi label="Weighted Pipeline" value={`$${weighted.toLocaleString()}`} />
        </div>

        {/* Clients table */}
        <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Client</Th>
                <Th>Type</Th>
                <Th>Stage</Th>
                <Th>MRR</Th>
                <Th>AR</Th>
                <Th>Weighted</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(clients.length ? clients : []).map((c) => (
                <tr key={c.client_id} className="hover:bg-gray-50">
                  <Td>{c.client_name}</Td>
                  <Td>{c.client_type ?? "-"}</Td>
                  <Td>{c.pipeline_stage ?? "-"}</Td>
                  <Td>${(c.mrr ?? 0).toLocaleString()}</Td>
                  <Td>${(c.ar_outstanding ?? 0).toLocaleString()}</Td>
                  <Td>${(c.weighted_value ?? 0).toLocaleString()}</Td>
                </tr>
              ))}
              {!clients.length && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>
                    No data yet. Add clients or pipeline to see live metrics.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pipeline summary (optional read-out) */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-3">
          <div className="text-sm font-medium mb-2">Pipeline by Stage</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Stage</Th>
                  <Th>Deals</Th>
                  <Th>Total</Th>
                  <Th>Weighted</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(forecast.length ? forecast : []).map((r) => (
                  <tr key={r.stage}>
                    <Td>{r.stage}</Td>
                    <Td>{r.deals}</Td>
                    <Td>${(r.total_value ?? 0).toLocaleString()}</Td>
                    <Td>${(r.weighted_value ?? 0).toLocaleString()}</Td>
                  </tr>
                ))}
                {!forecast.length && (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={4}>
                      No pipeline yet. Add opportunities to populate this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
