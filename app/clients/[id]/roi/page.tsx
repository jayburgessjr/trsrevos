import { TRSRevenueSimulator } from "@/components/ui/trs-revenue-simulator";

export default function ClientROISimulatorPage() {
  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="mb-6 text-2xl font-semibold text-black">
        Client ROI Simulator
      </h1>
      <TRSRevenueSimulator
        label="Client Monthly Sales Volume"
        metric="Revenue Compounding"
        unit="%"
      />
    </main>
  );
}
