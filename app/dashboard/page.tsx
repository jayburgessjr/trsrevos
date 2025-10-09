import { getExecDashboard, exportBoardDeck } from "@/core/exec/actions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const d = await getExecDashboard();

  return <DashboardClient data={d} exportAction={exportBoardDeck} />;
}
