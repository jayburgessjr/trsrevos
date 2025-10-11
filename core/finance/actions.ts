'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAnalyticsEvent } from '@/core/analytics/actions'
import { requireAuth } from '@/lib/server/auth'
import type {
  Invoice,
  InvoiceLineItem,
  Subscription,
  Expense,
  ProfitLoss,
  CashFlowEntry,
  CashFlowForecast,
  FinancialMetrics,
  EquityHolder,
} from './types'

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

/**
 * Get all invoices with client information
 */
export async function getInvoices(): Promise<Invoice[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(name),
      line_items:invoice_line_items(*)
    `)
    .order('issue_date', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return (data || []).map((invoice: any) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    clientId: invoice.client_id,
    clientName: invoice.client?.name || 'Unknown Client',
    status: invoice.status,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    paidDate: invoice.paid_date,
    amount: invoice.amount,
    tax: invoice.tax,
    total: invoice.total,
    paymentTerm: invoice.payment_term,
    notes: invoice.notes,
    lineItems: (invoice.line_items || []).map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
    })),
  }))
}

/**
 * Get a single invoice by ID
 */
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(name),
      line_items:invoice_line_items(*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching invoice:', error)
    return null
  }

  return {
    id: data.id,
    invoiceNumber: data.invoice_number,
    clientId: data.client_id,
    clientName: data.client?.name || 'Unknown Client',
    status: data.status,
    issueDate: data.issue_date,
    dueDate: data.due_date,
    paidDate: data.paid_date,
    amount: data.amount,
    tax: data.tax,
    total: data.total,
    paymentTerm: data.payment_term,
    notes: data.notes,
    lineItems: (data.line_items || []).map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
    })),
  }
}

/**
 * Create a new invoice
 */
export async function createInvoice(input: {
  clientId: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  paymentTerm: string
  lineItems: Array<{
    description: string
    quantity: number
    unitPrice: number
  }>
  notes?: string
}): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  const supabase = await createClient()

  // Calculate totals
  const amount = input.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const tax = 0 // TODO: Add tax calculation
  const total = amount + tax

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      client_id: input.clientId,
      invoice_number: input.invoiceNumber,
      status: input.status,
      issue_date: input.issueDate,
      due_date: input.dueDate,
      payment_term: input.paymentTerm,
      amount,
      tax,
      total,
      notes: input.notes,
    })
    .select()
    .single()

  if (invoiceError || !invoice) {
    console.error('Error creating invoice:', invoiceError)
    return { success: false, error: invoiceError?.message }
  }

  // Create line items
  const lineItemsData = input.lineItems.map((item) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }))

  const { error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .insert(lineItemsData)

  if (lineItemsError) {
    console.error('Error creating line items:', lineItemsError)
    return { success: false, error: lineItemsError.message }
  }

  await logAnalyticsEvent({
    eventKey: 'finance.invoice.created',
    payload: { invoiceId: invoice.id, total },
  })

  revalidatePath('/finance')
  return { success: true, invoice: await getInvoiceById(invoice.id) || undefined }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  id: string,
  status: string,
  paidDate?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const updates: any = { status }
  if (status === 'Paid' && paidDate) {
    updates.paid_date = paidDate
  }

  const { error } = await supabase.from('invoices').update(updates).eq('id', id)

  if (error) {
    console.error('Error updating invoice status:', error)
    return { success: false, error: error.message }
  }

  await logAnalyticsEvent({
    eventKey: 'finance.invoice.status_updated',
    payload: { invoiceId: id, status },
  })

  revalidatePath('/finance')
  return { success: true }
}

/**
 * Get collections queue (overdue invoices)
 */
export async function getCollectionsQueue(): Promise<Invoice[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(name)
    `)
    .in('status', ['Sent', 'Overdue'])
    .lt('due_date', today)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching collections queue:', error)
    return []
  }

  return (data || []).map((invoice: any) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    clientId: invoice.client_id,
    clientName: invoice.client?.name || 'Unknown Client',
    status: invoice.status,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    paidDate: invoice.paid_date,
    amount: invoice.amount,
    tax: invoice.tax,
    total: invoice.total,
    paymentTerm: invoice.payment_term,
    notes: invoice.notes,
    lineItems: [],
  }))
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Get all subscriptions with client information
 */
export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      client:clients(name)
    `)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching subscriptions:', error)
    return []
  }

  return (data || []).map((sub: any) => ({
    id: sub.id,
    clientId: sub.client_id,
    clientName: sub.client?.name || 'Unknown Client',
    productName: sub.product_name,
    status: sub.status,
    mrr: sub.mrr,
    arr: sub.arr,
    billingFrequency: sub.billing_frequency,
    startDate: sub.start_date,
    renewalDate: sub.renewal_date,
    nextBillingDate: sub.next_billing_date,
    contractValue: sub.contract_value,
    paymentMethod: sub.payment_method,
    autoRenew: sub.auto_renew,
    notes: sub.notes,
  }))
}

/**
 * Get subscription metrics (MRR, ARR, etc.)
 */
export async function getSubscriptionMetrics(): Promise<{
  mrr: number
  arr: number
  activeCount: number
  trialCount: number
  avgContractValue: number
}> {
  const supabase = await createClient()

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('status, mrr, arr, contract_value')

  if (error || !subscriptions) {
    console.error('Error fetching subscription metrics:', error)
    return { mrr: 0, arr: 0, activeCount: 0, trialCount: 0, avgContractValue: 0 }
  }

  const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'Active')
  const trialSubscriptions = subscriptions.filter((s: any) => s.status === 'Trial')

  const mrr = activeSubscriptions.reduce((sum: number, s: any) => sum + (s.mrr || 0), 0)
  const arr = activeSubscriptions.reduce((sum: number, s: any) => sum + (s.arr || 0), 0)
  const avgContractValue =
    activeSubscriptions.length > 0
      ? activeSubscriptions.reduce((sum: number, s: any) => sum + (s.contract_value || 0), 0) /
        activeSubscriptions.length
      : 0

  return {
    mrr,
    arr,
    activeCount: activeSubscriptions.length,
    trialCount: trialSubscriptions.length,
    avgContractValue,
  }
}

/**
 * Create a new subscription
 */
export async function createSubscription(input: {
  clientId: string
  productName: string
  status: string
  mrr: number
  arr: number
  billingFrequency: string
  startDate: string
  renewalDate: string
  nextBillingDate: string
  contractValue: number
  paymentMethod?: string
  autoRenew: boolean
  notes?: string
}): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      client_id: input.clientId,
      product_name: input.productName,
      status: input.status,
      mrr: input.mrr,
      arr: input.arr,
      billing_frequency: input.billingFrequency,
      start_date: input.startDate,
      renewal_date: input.renewalDate,
      next_billing_date: input.nextBillingDate,
      contract_value: input.contractValue,
      payment_method: input.paymentMethod,
      auto_renew: input.autoRenew,
      notes: input.notes,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating subscription:', error)
    return { success: false, error: error?.message }
  }

  await logAnalyticsEvent({
    eventKey: 'finance.subscription.created',
    payload: { subscriptionId: data.id, mrr: input.mrr },
  })

  revalidatePath('/finance')
  return { success: true }
}

/**
 * Update subscription status
 */
export async function updateSubscription(
  id: string,
  updates: Partial<{
    status: string
    mrr: number
    arr: number
    nextBillingDate: string
  }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const dbUpdates: any = {}
  if (updates.status) dbUpdates.status = updates.status
  if (updates.mrr !== undefined) dbUpdates.mrr = updates.mrr
  if (updates.arr !== undefined) dbUpdates.arr = updates.arr
  if (updates.nextBillingDate) dbUpdates.next_billing_date = updates.nextBillingDate

  const { error } = await supabase.from('subscriptions').update(dbUpdates).eq('id', id)

  if (error) {
    console.error('Error updating subscription:', error)
    return { success: false, error: error.message }
  }

  await logAnalyticsEvent({
    eventKey: 'finance.subscription.updated',
    payload: { subscriptionId: id, updates },
  })

  revalidatePath('/finance')
  return { success: true }
}

// ============================================================================
// EXPENSE TRACKING
// ============================================================================

/**
 * Get all expenses
 */
export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }

  return (data || []).map((expense: any) => ({
    id: expense.id,
    date: expense.date,
    category: expense.category,
    vendor: expense.vendor,
    description: expense.description,
    amount: expense.amount,
    recurring: expense.recurring,
    recurringFrequency: expense.recurring_frequency,
    approved: expense.approved,
    approvedBy: expense.approved_by,
    receiptUrl: expense.receipt_url,
    notes: expense.notes,
  }))
}

/**
 * Create a new expense
 */
export async function createExpense(input: {
  date: string
  category: string
  vendor: string
  description: string
  amount: number
  recurring: boolean
  recurringFrequency?: string
  receiptUrl?: string
  notes?: string
}): Promise<{ success: boolean; expense?: Expense; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      date: input.date,
      category: input.category,
      vendor: input.vendor,
      description: input.description,
      amount: input.amount,
      recurring: input.recurring,
      recurring_frequency: input.recurringFrequency,
      receipt_url: input.receiptUrl,
      notes: input.notes,
      approved: false,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating expense:', error)
    return { success: false, error: error?.message }
  }

  await logAnalyticsEvent({
    eventKey: 'finance.expense.created',
    payload: { expenseId: data.id, amount: input.amount },
  })

  revalidatePath('/finance')
  return { success: true }
}

/**
 * Approve an expense
 */
export async function approveExpense(
  id: string,
  approvedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('expenses')
    .update({ approved: true, approved_by: approvedBy })
    .eq('id', id)

  if (error) {
    console.error('Error approving expense:', error)
    return { success: false, error: error.message }
  }

  await logAnalyticsEvent({
    eventKey: 'finance.expense.approved',
    payload: { expenseId: id },
  })

  revalidatePath('/finance')
  return { success: true }
}

// ============================================================================
// CASH FLOW
// ============================================================================

/**
 * Get cash flow entries
 */
export async function getCashFlowEntries(): Promise<CashFlowEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cash_flow_entries')
    .select('*')
    .order('date', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching cash flow entries:', error)
    return []
  }

  return (data || []).map((entry: any) => ({
    id: entry.id,
    date: entry.date,
    type: entry.type,
    category: entry.category,
    description: entry.description,
    amount: entry.amount,
    balance: entry.balance,
    source: entry.source,
  }))
}

/**
 * Get cash flow forecast
 */
export async function getCashFlowForecast(): Promise<CashFlowForecast[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cash_flow_forecast')
    .select('*')
    .order('month', { ascending: true })
    .limit(12)

  if (error) {
    console.error('Error fetching cash flow forecast:', error)
    return []
  }

  return (data || []).map((forecast: any) => ({
    month: forecast.month,
    beginningBalance: forecast.beginning_balance,
    expectedInflows: forecast.expected_inflows,
    expectedOutflows: forecast.expected_outflows,
    endingBalance: forecast.ending_balance,
    runway: forecast.runway_months,
  }))
}

// ============================================================================
// PROFIT & LOSS
// ============================================================================

/**
 * Get profit & loss statements
 */
export async function getProfitLoss(): Promise<ProfitLoss[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profit_loss_periods')
    .select('*')
    .order('period', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error fetching profit & loss:', error)
    return []
  }

  return (data || []).map((pl: any) => ({
    period: pl.period,
    revenue: pl.revenue,
    expenses: pl.expenses,
    netIncome: pl.net_income,
    profitMargin: pl.profit_margin,
  }))
}

// ============================================================================
// EQUITY
// ============================================================================

/**
 * Get equity holders (cap table)
 */
export async function getEquityHolders(): Promise<EquityHolder[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equity_holders')
    .select('*')
    .order('percentage', { ascending: false })

  if (error) {
    console.error('Error fetching equity holders:', error)
    return []
  }

  return (data || []).map((holder: any) => ({
    id: holder.id,
    name: holder.name,
    holderType: holder.holder_type,
    equityType: holder.equity_type,
    shares: holder.shares,
    percentage: holder.percentage,
    valueAtCurrent: holder.value_at_current,
    investmentDate: holder.investment_date,
    vestingSchedule: holder.vesting_schedule,
    notes: holder.notes,
  }))
}

// ============================================================================
// FINANCIAL METRICS
// ============================================================================

/**
 * Calculate comprehensive financial metrics
 */
export async function getFinancialMetrics(): Promise<FinancialMetrics> {
  const supabase = await createClient()

  // Get latest cash balance from cash flow
  const { data: latestCashFlow } = await supabase
    .from('cash_flow_entries')
    .select('balance')
    .order('date', { ascending: false })
    .limit(1)
    .single()

  const cash = latestCashFlow?.balance || 0

  // Get subscription metrics
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('mrr, arr, status')
    .eq('status', 'Active')

  const mrr = subscriptions?.reduce((sum, s) => sum + (s.mrr || 0), 0) || 0
  const arr = subscriptions?.reduce((sum, s) => sum + (s.arr || 0), 0) || 0

  // Get outstanding AR (invoices not paid)
  const { data: unpaidInvoices } = await supabase
    .from('invoices')
    .select('total')
    .in('status', ['Sent', 'Overdue'])

  const outstandingAR = unpaidInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  // Get recent P&L for margins
  const { data: recentPL } = await supabase
    .from('profit_loss_periods')
    .select('*')
    .order('period', { ascending: false })
    .limit(1)
    .single()

  const totalRevenue = recentPL?.revenue?.total || 0
  const totalExpenses = recentPL?.expenses?.total || 0
  const netIncome = recentPL?.net_income || 0
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses * 0.25) / totalRevenue) * 100 : 0
  const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0

  // Calculate burn rate (average monthly expenses)
  const { data: recentExpenses } = await supabase
    .from('expenses')
    .select('amount')
    .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

  const burnRate = recentExpenses
    ? recentExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) / 3
    : 0

  // Calculate runway
  const runway = burnRate > 0 ? Math.floor(cash / burnRate) : 999

  // Placeholder values for CAC, LTV (would need more complex calculations)
  const cac = 8500
  const ltv = 95000
  const ltvCacRatio = ltv / cac

  return {
    cash,
    totalRevenue,
    mrr,
    arr,
    grossMargin,
    netMargin,
    burnRate,
    runway,
    cac,
    ltv,
    ltvCacRatio,
    outstandingAR,
    outstandingAP: 0, // TODO: Add AP tracking
  }
}

// ============================================================================
// SYNC FUNCTION
// ============================================================================

type SyncFinanceDataResult =
  | { ok: true; invoices_processed?: number }
  | { ok: false; error: string };

export async function syncFinanceData(): Promise<SyncFinanceDataResult> {
  const { supabase, user, organizationId } = await requireAuth({ redirectTo: '/login?next=/finance' })

  if (!organizationId) {
    return { ok: false, error: 'missing-organization' }
  }

  const { data, error } = await supabase.functions.invoke('finance-sync', {
    body: { organization_id: organizationId, triggered_by: user.id },
  })

  if (error) {
    console.error('finance:sync-failed', error)
    return { ok: false, error: error.message }
  }

  await logAnalyticsEvent({
    eventKey: 'finance.sync.triggered',
    payload: data as Record<string, unknown>,
  })

  revalidatePath('/finance')

  const invoicesProcessed = (data as Record<string, unknown> | null | undefined)?.invoices_processed
  return {
    ok: true,
    invoices_processed: typeof invoicesProcessed === 'number' ? invoicesProcessed : undefined,
  }
}
