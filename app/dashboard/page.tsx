"use client";
import * as React from "react";
import { Card } from "@/components/kit/Card";
import { StatCard } from "@/components/kit/StatCard";
import { LineChart, AreaChart, BarChart } from "@/components/kit/Charts";

const H = { gap: 12 };

export default function DashboardPage() {
  return <ViewportGrid />;
}

function ViewportGrid() {
  return (
    <div className="p-3">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(12, minmax(0,1fr))",
          gridTemplateRows: "110px 200px 220px",
          gap: H.gap,
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
