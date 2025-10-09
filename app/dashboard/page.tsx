"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Bell, Download, Home, Search } from "lucide-react";
import AdminSidebar from "@/components/nav/AdminSidebar";
import { TopTabs } from "@/components/kit/TopTabs";
import { Card } from "@/components/kit/Card";
import { StatCard } from "@/components/kit/StatCard";
import { LineChart, AreaChart, BarChart } from "@/components/kit/Charts";

const H = { header: 56, tabs: 44, gap: 12 };

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "Overview";
  return (
    <div className="w-full min-h-screen bg-white text-black">
      <header style={{ height: H.header }} className="border-b border-gray-200 flex items-center">
        <div className="px-3 w-full flex items-center gap-3">
          <button className="h-9 w-9 rounded-lg border flex items-center justify-center">
            <Home size={16} />
          </button>
          <div className="text-lg font-semibold">Dashboard</div>
          <div className="ml-4 flex items-center gap-2 h-9 px-2 rounded-lg border flex-1 max-w-xl">
            <Search size={16} className="text-gray-500" />
            <input placeholder="Search" className="flex-1 outline-none text-sm bg-transparent" />
          </div>
          <button className="h-9 px-3 rounded-lg border flex items-center gap-2 text-sm">
            <Download size={16} /> Download
          </button>
          <button className="h-9 w-9 rounded-lg border flex items-center justify-center">
            <Bell size={16} />
          </button>
          <button className="h-9 w-9 rounded-full bg-gray-200" aria-label="Account" />
        </div>
      </header>

      <div className="flex" style={{ height: `calc(100vh - ${H.header}px)` }}>
        <AdminSidebar />
        <main className="flex-1" style={{ height: `calc(100vh - ${H.header}px)` }}>
          <div className="px-3 border-b border-gray-200 flex items-center justify-between" style={{ height: H.tabs }}>
            <TopTabs />
            <div className="text-xs text-gray-600">
              <span className="sr-only">Current tab: {tab}</span>
              Pick a date
            </div>
          </div>
          <ViewportGrid />
        </main>
      </div>
    </div>
  );
}

function ViewportGrid() {
  const [vh, setVh] = React.useState(800);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const contentH = (vh ?? 800) - H.header - H.tabs - H.gap * 2;

  return (
    <div className="p-3" style={{ height: contentH }}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(12, minmax(0,1fr))",
          gridTemplateRows: "110px 200px 220px",
          gap: H.gap,
          height: "100%",
        }}
      >
        <div className="col-span-3">
          <StatCard label="New Subscriptions" value="4,682" delta="+15.5%" trend="up" />
        </div>
        <div className="col-span-3">
          <StatCard label="New Orders" value="1,226" delta="-40.2%" trend="down" />
        </div>
        <div className="col-span-3">
          <StatCard label="Avg Order Revenue" value="1,080" delta="+10.8%" trend="up" />
        </div>
        <Card title="Total Revenue" className="col-span-3">
          <div className="h-[66px] p-2">
            <LineChart />
          </div>
        </Card>

        <Card title="Sale Activity - Monthly" subtitle="Last 6 months" className="col-span-8">
          <div className="h-[156px] p-2">
            <AreaChart />
          </div>
        </Card>
        <Card title="Subscriptions" subtitle="+180% MoM" className="col-span-4">
          <div className="h-[156px] p-2">
            <BarChart />
          </div>
        </Card>

        <Card
          title="Payments"
          className="col-span-8"
          action={<button className="text-xs px-2 py-1 rounded-md border">Columns</button>}
        >
          <div className="h-[176px] overflow-hidden">
            <Table
              rows={[
                { status: "Success", email: "ken99@yahoo.com", amount: "$316.00" },
                { status: "Success", email: "abe45@gmail.com", amount: "$242.00" },
                { status: "Pending", email: "lee@acme.com", amount: "$1,120.00" },
                { status: "Failed", email: "ops@vendor.com", amount: "$88.00" },
              ]}
            />
          </div>
        </Card>
        <Card title="Team Members" className="col-span-4">
          <div className="h-[176px] p-3 text-sm">
            <Member name="Dale Komen" role="Member" email="dale@example.com" />
            <Member name="Sofia Davis" role="Owner" email="m@example.com" />
            <Member name="Jackson Lee" role="Member" email="p@example.com" />
            <Member name="Isabella Nguyen" role="Member" email="x@example.com" />
          </div>
        </Card>
      </div>
    </div>
  );
}

type TableRow = { status: string; email: string; amount: string };

function Table({ rows }: { rows: Array<TableRow> }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[12px] text-gray-600">
          <th className="px-3 py-2">Status</th>
          <th className="px-3 py-2">Email</th>
          <th className="px-3 py-2">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((r, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="px-3 py-2">{r.status}</td>
            <td className="px-3 py-2">{r.email}</td>
            <td className="px-3 py-2">{r.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Member({ name, role, email }: { name: string; role: string; email: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div>
          <div className="text-sm font-medium leading-none text-black">{name}</div>
          <div className="text-[11px] text-gray-500">{email}</div>
        </div>
      </div>
      <button className="text-xs px-2 py-1 rounded-md border">{role}</button>
    </div>
  );
}
