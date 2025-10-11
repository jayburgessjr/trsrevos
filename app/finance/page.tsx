import {
  getEquityHolders,
  getInvoices,
  getSubscriptions,
  getExpenses,
  getProfitLoss,
  getCashFlowEntries,
  getCashFlowForecast,
  getFinancialMetrics,
} from "@/core/finance/actions";
import { FinancePageClient } from "./FinancePageClient";

export default async function FinancePage() {
  // Fetch all data server-side in parallel
  const [
    equityHolders,
    invoices,
    subscriptions,
    expenses,
    profitLoss,
    cashFlow,
    cashFlowForecast,
    metrics,
  ] = await Promise.all([
    getEquityHolders(),
    getInvoices(),
    getSubscriptions(),
    getExpenses(),
    getProfitLoss(),
    getCashFlowEntries(),
    getCashFlowForecast(),
    getFinancialMetrics(),
  ]);

  return (
    <FinancePageClient
      equityHolders={equityHolders}
      invoices={invoices}
      subscriptions={subscriptions}
      expenses={expenses}
      profitLoss={profitLoss}
      cashFlow={cashFlow}
      cashFlowForecast={cashFlowForecast}
      metrics={metrics}
    />
  );
}
