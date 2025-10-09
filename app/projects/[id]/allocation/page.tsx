import { TRSRevenueSimulator } from "@/components/ui/trs-revenue-simulator";

export default function ProjectAllocationROISimulatorPage() {
  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="mb-6 text-2xl font-semibold text-black">
        Project Allocation ROI
      </h1>
      <TRSRevenueSimulator
        label="Team Hours Allocated"
        metric="Operational Yield"
        unit="%"
      />
    </main>
  );
}
