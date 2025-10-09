import { TRSRevenueSimulator } from "@/components/ui/trs-revenue-simulator";

export default function ForecastDashboardSimulatorPage() {
  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="mb-6 text-2xl font-semibold text-black">
        Forecast Simulator
      </h1>
      <TRSRevenueSimulator
        label="Quarterly Revenue Growth"
        metric="Forecast Accuracy"
        unit="%"
      />
    </main>
  );
}
