import { TRSRevenueSimulator } from "@/components/ui/trs-revenue-simulator";

export default function CompensationModelSimulatorPage() {
  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="mb-6 text-2xl font-semibold text-black">
        Compensation Modeling
      </h1>
      <TRSRevenueSimulator
        label="Revenue Target"
        metric="Payout Efficiency"
        unit="%"
      />
    </main>
  );
}
