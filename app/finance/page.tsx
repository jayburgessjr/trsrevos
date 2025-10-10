"use client"

import { useMemo } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { PageDescription, PageTitle } from "@/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table"
import { Button } from "@/ui/button"
import { cn } from "@/lib/utils"
import { TRS_CARD, TRS_SECTION_TITLE, TRS_SUBTITLE } from "@/lib/style"
import { resolveTabs } from "@/lib/tabs"
import {
  getEquityHolders,
  getInvoices,
  getSubscriptions,
  getExpenses,
  getProfitLoss,
  getCashFlow,
  getCashFlowForecast,
  getFinancialMetrics,
} from "@/core/finance/store"

export default function FinancePage() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabs = useMemo(() => resolveTabs(pathname), [pathname])
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab")
    return current && tabs.includes(current) ? current : tabs[0]
  }, [searchParams, tabs])

  const equityHolders = useMemo(() => getEquityHolders(), [])
  const invoices = useMemo(() => getInvoices(), [])
  const subscriptions = useMemo(() => getSubscriptions(), [])
  const expenses = useMemo(() => getExpenses(), [])
  const profitLoss = useMemo(() => getProfitLoss(), [])
  const cashFlow = useMemo(() => getCashFlow(), [])
  const cashFlowForecast = useMemo(() => getCashFlowForecast(), [])
  const metrics = useMemo(() => getFinancialMetrics(), [])

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`
  const formatPercent = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      {/* KPI Cards - Always Visible */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Cash Balance</div>
            <div className="text-2xl font-semibold text-black">{formatCurrency(metrics.cash)}</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">{metrics.runway} months</span>
              <span>runway</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>MRR</div>
            <div className="text-2xl font-semibold text-black">${(metrics.mrr / 1000).toFixed(0)}K</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">ARR</span>
              <span>${(metrics.arr / 1000).toFixed(0)}K</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Gross Margin</div>
            <div className="text-2xl font-semibold text-black">{formatPercent(metrics.grossMargin)}</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">Net</span>
              <span>{formatPercent(metrics.netMargin)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>LTV / CAC</div>
            <div className="text-2xl font-semibold text-black">{metrics.ltvCacRatio.toFixed(1)}x</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">Burn</span>
              <span>${(metrics.burnRate / 1000).toFixed(0)}K/mo</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="space-y-4">
          <div className={cn(TRS_CARD, "p-4 space-y-3")}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <PageTitle className="text-lg font-semibold text-black">Financial Overview</PageTitle>
                <PageDescription className="text-sm text-gray-500">
                  Comprehensive view of equity, revenue, expenses, and cash flow
                </PageDescription>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <Card className={cn(TRS_CARD)}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Cash Flow</CardTitle>
              <CardDescription>Latest transactions impacting cash position</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlow.slice(0, 5).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.type === 'Inflow' ? 'success' : 'default'}>
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{entry.description}</TableCell>
                      <TableCell className={cn(
                        "text-right font-medium",
                        entry.type === 'Inflow' ? 'text-emerald-600' : 'text-rose-600'
                      )}>
                        {entry.type === 'Inflow' ? '+' : '-'}{formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(entry.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Equity" && (
        <div className="space-y-4">
          <Card className={cn(TRS_CARD)}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Cap Table</CardTitle>
                  <CardDescription>Equity ownership and vesting schedules</CardDescription>
                </div>
                <Button variant="primary" size="sm">Add Equity Grant</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                <div>
                  <div className="text-xs text-gray-500">Total Shares</div>
                  <div className="text-lg font-semibold text-black">
                    {equityHolders.reduce((sum, h) => sum + h.shares, 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Fully Diluted Value</div>
                  <div className="text-lg font-semibold text-black">
                    {formatCurrency(equityHolders.reduce((sum, h) => sum + h.valueAtCurrent, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Founders</div>
                  <div className="text-lg font-semibold text-black">
                    {formatPercent(equityHolders.filter(h => h.holderType === 'Founder').reduce((sum, h) => sum + h.percentage, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Investors</div>
                  <div className="text-lg font-semibold text-black">
                    {formatPercent(equityHolders.filter(h => h.holderType === 'Investor').reduce((sum, h) => sum + h.percentage, 0))}
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Equity Type</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Vesting</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equityHolders.map((holder) => (
                    <TableRow key={holder.id}>
                      <TableCell className="font-medium">{holder.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{holder.holderType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{holder.equityType}</TableCell>
                      <TableCell className="text-right">{holder.shares.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{formatPercent(holder.percentage)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(holder.valueAtCurrent)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {holder.vestingSchedule ? (
                          <span>
                            {holder.vestingSchedule.vestedShares.toLocaleString()} / {holder.vestingSchedule.totalShares.toLocaleString()} vested
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Billing" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={TRS_SECTION_TITLE}>Invoices & Billing</h2>
              <p className={TRS_SUBTITLE}>Track outstanding invoices and payment collection</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Export</Button>
              <Button variant="primary" size="sm">New Invoice</Button>
            </div>
          </div>

          {/* Billing Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Total Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-black">
                  {formatCurrency(invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.total, 0))}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-rose-600">
                  {formatCurrency(invoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.total, 0))}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {invoices.filter(i => i.status === 'Overdue').length} invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Paid This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-emerald-600">
                  {formatCurrency(invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0))}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-black">
                  {formatCurrency(invoices.filter(i => i.status === 'Sent').reduce((sum, i) => sum + i.total, 0))}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {invoices.filter(i => i.status === 'Sent').length} invoices
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>Complete invoice history and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>
                        <Badge variant={
                          invoice.status === 'Paid' ? 'success' :
                          invoice.status === 'Overdue' ? 'destructive' :
                          invoice.status === 'Sent' ? 'default' :
                          'outline'
                        }>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(invoice.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Subscriptions" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={TRS_SECTION_TITLE}>Recurring Revenue</h2>
              <p className={TRS_SUBTITLE}>Subscription management and MRR/ARR tracking</p>
            </div>
            <Button variant="primary" size="sm">New Subscription</Button>
          </div>

          {/* MRR/ARR Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-black">
                  {formatCurrency(subscriptions.filter(s => s.status === 'Active').reduce((sum, s) => sum + s.mrr, 0))}
                </p>
                <p className="text-xs text-emerald-600 mt-1">+12% vs last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Annual Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-black">
                  {formatCurrency(subscriptions.filter(s => s.status === 'Active').reduce((sum, s) => sum + s.arr, 0))}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-black">
                  {subscriptions.filter(s => s.status === 'Active').length}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {subscriptions.filter(s => s.status === 'Trial').length} in trial
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Avg Contract Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-black">
                  {formatCurrency(
                    subscriptions.filter(s => s.status === 'Active').reduce((sum, s) => sum + s.contractValue, 0) /
                    subscriptions.filter(s => s.status === 'Active').length
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>Customer subscriptions and recurring revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead className="text-right">MRR</TableHead>
                    <TableHead className="text-right">ARR</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Renewal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.clientName}</TableCell>
                      <TableCell className="text-sm text-gray-600">{sub.productName}</TableCell>
                      <TableCell>
                        <Badge variant={
                          sub.status === 'Active' ? 'success' :
                          sub.status === 'Trial' ? 'default' :
                          sub.status === 'Paused' ? 'outline' :
                          'destructive'
                        }>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{sub.billingFrequency}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(sub.mrr)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(sub.arr)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(sub.nextBillingDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(sub.renewalDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Expenses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={TRS_SECTION_TITLE}>Expenses & P&L</h2>
              <p className={TRS_SUBTITLE}>Track expenses and profit/loss statements</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Export P&L</Button>
              <Button variant="primary" size="sm">Add Expense</Button>
            </div>
          </div>

          {/* P&L Summary */}
          {profitLoss[0] && (
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss - {profitLoss[0].period}</CardTitle>
                <CardDescription>Income statement for the current period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Revenue</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subscriptions</span>
                        <span className="font-medium">{formatCurrency(profitLoss[0].revenue.subscriptions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Services</span>
                        <span className="font-medium">{formatCurrency(profitLoss[0].revenue.services)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Other</span>
                        <span className="font-medium">{formatCurrency(profitLoss[0].revenue.other)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold text-black">Total Revenue</span>
                        <span className="font-semibold text-black">{formatCurrency(profitLoss[0].revenue.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Expenses</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payroll & Benefits</span>
                        <span className="font-medium">{formatCurrency(profitLoss[0].expenses.payroll)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Marketing</span>
                        <span className="font-medium">{formatCurrency(profitLoss[0].expenses.marketing)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Software & Tools</span>
                        <span className="font-medium">{formatCurrency(profitLoss[0].expenses.software)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Office & Equipment</span>
                        <span className="font-medium">{formatCurrency(profitLoss[0].expenses.office)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Professional Services</span>
                        <span className="font-medium">{formatCurrency(profitLoss[0].expenses.professional)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hosting & Infrastructure</span>
                        <span className="font-medium">{formatCurrency(profitLoss[0].expenses.hosting)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Other</span>
                        <span className="font-medium">{formatCurrency(profitLoss[0].expenses.other)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold text-black">Total Expenses</span>
                        <span className="font-semibold text-black">{formatCurrency(profitLoss[0].expenses.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-black">Net Income</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(profitLoss[0].netIncome)}</div>
                        <div className="text-sm text-gray-600">{formatPercent(profitLoss[0].profitMargin)} margin</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Latest expense transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{expense.vendor}</TableCell>
                      <TableCell className="text-sm text-gray-600">{expense.description}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={expense.approved ? 'success' : 'default'}>
                          {expense.approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Cash Flow" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={TRS_SECTION_TITLE}>Cash Flow & Forecasting</h2>
              <p className={TRS_SUBTITLE}>Monitor cash position and forecast future runway</p>
            </div>
            <Button variant="primary" size="sm">Update Forecast</Button>
          </div>

          {/* Cash Flow Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>3-Month Cash Flow Forecast</CardTitle>
              <CardDescription>Projected cash position and runway</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Beginning Balance</TableHead>
                    <TableHead className="text-right">Expected Inflows</TableHead>
                    <TableHead className="text-right">Expected Outflows</TableHead>
                    <TableHead className="text-right">Ending Balance</TableHead>
                    <TableHead className="text-right">Runway (months)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlowForecast.map((forecast) => (
                    <TableRow key={forecast.month}>
                      <TableCell className="font-medium">{forecast.month}</TableCell>
                      <TableCell className="text-right">{formatCurrency(forecast.beginningBalance)}</TableCell>
                      <TableCell className="text-right text-emerald-600">
                        +{formatCurrency(forecast.expectedInflows)}
                      </TableCell>
                      <TableCell className="text-right text-rose-600">
                        -{formatCurrency(forecast.expectedOutflows)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(forecast.endingBalance)}
                      </TableCell>
                      <TableCell className="text-right font-medium">{forecast.runway}mo</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Cash Flow History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Cash Flow Transactions</CardTitle>
              <CardDescription>Detailed cash inflows and outflows</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlow.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.type === 'Inflow' ? 'success' : 'default'}>
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{entry.category}</TableCell>
                      <TableCell className="font-medium">{entry.description}</TableCell>
                      <TableCell className={cn(
                        "text-right font-medium",
                        entry.type === 'Inflow' ? 'text-emerald-600' : 'text-rose-600'
                      )}>
                        {entry.type === 'Inflow' ? '+' : '-'}{formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(entry.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
