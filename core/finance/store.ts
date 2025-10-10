import type {
  EquityHolder,
  Invoice,
  Subscription,
  Expense,
  ProfitLoss,
  CashFlowEntry,
  CashFlowForecast,
  FinancialMetrics,
} from './types';

// Sample Equity Data
const equityHolders: EquityHolder[] = [
  {
    id: 'eq-1',
    name: 'John Burgess',
    holderType: 'Founder',
    equityType: 'Common Stock',
    shares: 7000000,
    percentage: 70.0,
    valueAtCurrent: 7000000,
    investmentDate: '2020-01-15',
    vestingSchedule: {
      totalShares: 7000000,
      vestedShares: 7000000,
      vestingStartDate: '2020-01-15',
      cliffMonths: 12,
      vestingMonths: 48,
    },
  },
  {
    id: 'eq-2',
    name: 'Angel Investors Pool',
    holderType: 'Investor',
    equityType: 'Preferred Stock',
    shares: 1500000,
    percentage: 15.0,
    valueAtCurrent: 1875000,
    investmentDate: '2021-03-20',
    notes: 'Series Seed - $500K investment at $3.5M post-money',
  },
  {
    id: 'eq-3',
    name: 'Employee Option Pool',
    holderType: 'Employee',
    equityType: 'Options',
    shares: 1000000,
    percentage: 10.0,
    valueAtCurrent: 1000000,
    investmentDate: '2020-01-15',
    notes: 'Reserved for employee equity compensation',
  },
  {
    id: 'eq-4',
    name: 'Strategic Advisors',
    holderType: 'Advisor',
    equityType: 'Options',
    shares: 500000,
    percentage: 5.0,
    valueAtCurrent: 500000,
    investmentDate: '2020-06-01',
    vestingSchedule: {
      totalShares: 500000,
      vestedShares: 375000,
      vestingStartDate: '2020-06-01',
      cliffMonths: 0,
      vestingMonths: 24,
    },
  },
];

// Sample Invoices
const invoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2025-001',
    clientId: 'acme-corp',
    clientName: 'Acme Corp',
    status: 'Paid',
    issueDate: '2025-10-01',
    dueDate: '2025-10-31',
    paidDate: '2025-10-15',
    amount: 45000,
    tax: 0,
    total: 45000,
    paymentTerm: 'Net 30',
    lineItems: [
      {
        id: 'li-1',
        description: 'Revenue Operations Consulting - October 2025',
        quantity: 1,
        unitPrice: 45000,
        total: 45000,
      },
    ],
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2025-002',
    clientId: 'techstart',
    clientName: 'TechStart Inc',
    status: 'Sent',
    issueDate: '2025-10-05',
    dueDate: '2025-11-04',
    amount: 28000,
    tax: 0,
    total: 28000,
    paymentTerm: 'Net 30',
    lineItems: [
      {
        id: 'li-2',
        description: 'SaaS Platform Implementation',
        quantity: 1,
        unitPrice: 28000,
        total: 28000,
      },
    ],
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2025-003',
    clientId: 'global-tech',
    clientName: 'Global Tech Solutions',
    status: 'Overdue',
    issueDate: '2025-09-15',
    dueDate: '2025-10-15',
    amount: 35000,
    tax: 0,
    total: 35000,
    paymentTerm: 'Net 30',
    lineItems: [
      {
        id: 'li-3',
        description: 'Strategic Consulting - Q3 2025',
        quantity: 1,
        unitPrice: 35000,
        total: 35000,
      },
    ],
    notes: 'Follow up required',
  },
];

// Sample Subscriptions
const subscriptions: Subscription[] = [
  {
    id: 'sub-1',
    clientId: 'acme-corp',
    clientName: 'Acme Corp',
    productName: 'Revenue OS Platform - Enterprise',
    status: 'Active',
    mrr: 15000,
    arr: 180000,
    billingFrequency: 'Monthly',
    startDate: '2024-01-15',
    renewalDate: '2026-01-15',
    nextBillingDate: '2025-11-15',
    contractValue: 360000,
    paymentMethod: 'ACH',
    autoRenew: true,
  },
  {
    id: 'sub-2',
    clientId: 'techstart',
    clientName: 'TechStart Inc',
    productName: 'Revenue OS Platform - Growth',
    status: 'Active',
    mrr: 8000,
    arr: 96000,
    billingFrequency: 'Monthly',
    startDate: '2024-06-01',
    renewalDate: '2025-06-01',
    nextBillingDate: '2025-11-01',
    contractValue: 96000,
    paymentMethod: 'Credit Card',
    autoRenew: true,
  },
  {
    id: 'sub-3',
    clientId: 'startup-labs',
    clientName: 'Startup Labs',
    productName: 'Revenue OS Platform - Starter',
    status: 'Trial',
    mrr: 0,
    arr: 0,
    billingFrequency: 'Monthly',
    startDate: '2025-10-01',
    renewalDate: '2025-11-01',
    nextBillingDate: '2025-11-01',
    contractValue: 36000,
    autoRenew: false,
    notes: 'Trial ends Nov 1, convert to $3K/mo plan',
  },
  {
    id: 'sub-4',
    clientId: 'innovate-co',
    clientName: 'Innovate Co',
    productName: 'Consulting Retainer',
    status: 'Active',
    mrr: 12000,
    arr: 144000,
    billingFrequency: 'Monthly',
    startDate: '2024-03-01',
    renewalDate: '2025-03-01',
    nextBillingDate: '2025-11-01',
    contractValue: 144000,
    paymentMethod: 'Wire Transfer',
    autoRenew: true,
  },
];

// Sample Expenses
const expenses: Expense[] = [
  {
    id: 'exp-1',
    date: '2025-10-01',
    category: 'Payroll & Benefits',
    vendor: 'Gusto',
    description: 'October Payroll',
    amount: 45000,
    recurring: true,
    recurringFrequency: 'Monthly',
    approved: true,
    approvedBy: 'John Burgess',
  },
  {
    id: 'exp-2',
    date: '2025-10-03',
    category: 'Software & Tools',
    vendor: 'Various SaaS',
    description: 'Monthly software subscriptions',
    amount: 2500,
    recurring: true,
    recurringFrequency: 'Monthly',
    approved: true,
    approvedBy: 'John Burgess',
    notes: 'Includes Slack, Notion, GitHub, AWS, etc.',
  },
  {
    id: 'exp-3',
    date: '2025-10-05',
    category: 'Marketing & Advertising',
    vendor: 'Google Ads',
    description: 'October ad spend',
    amount: 5000,
    recurring: true,
    recurringFrequency: 'Monthly',
    approved: true,
    approvedBy: 'John Burgess',
  },
  {
    id: 'exp-4',
    date: '2025-10-07',
    category: 'Professional Services',
    vendor: 'Legal Partners LLP',
    description: 'Contract review and legal services',
    amount: 3500,
    recurring: false,
    approved: true,
    approvedBy: 'John Burgess',
  },
  {
    id: 'exp-5',
    date: '2025-10-10',
    category: 'Office & Equipment',
    vendor: 'WeWork',
    description: 'Office space rental - October',
    amount: 2000,
    recurring: true,
    recurringFrequency: 'Monthly',
    approved: true,
    approvedBy: 'John Burgess',
  },
];

// Sample P&L
const profitLoss: ProfitLoss[] = [
  {
    period: '2025-10',
    revenue: {
      subscriptions: 420000,
      services: 108000,
      other: 12000,
      total: 540000,
    },
    expenses: {
      payroll: 270000,
      marketing: 45000,
      software: 18000,
      office: 12000,
      travel: 8000,
      professional: 15000,
      hosting: 10000,
      other: 7000,
      total: 385000,
    },
    netIncome: 155000,
    profitMargin: 28.7,
  },
  {
    period: '2025-09',
    revenue: {
      subscriptions: 405000,
      services: 95000,
      other: 8000,
      total: 508000,
    },
    expenses: {
      payroll: 265000,
      marketing: 42000,
      software: 17500,
      office: 12000,
      travel: 5000,
      professional: 12000,
      hosting: 9500,
      other: 6000,
      total: 369000,
    },
    netIncome: 139000,
    profitMargin: 27.4,
  },
];

// Sample Cash Flow
const cashFlow: CashFlowEntry[] = [
  {
    id: 'cf-1',
    date: '2025-10-01',
    type: 'Inflow',
    category: 'Subscription Revenue',
    description: 'Monthly subscriptions collected',
    amount: 35000,
    balance: 485000,
    source: 'Stripe',
  },
  {
    id: 'cf-2',
    date: '2025-10-01',
    type: 'Outflow',
    category: 'Payroll',
    description: 'October payroll',
    amount: 45000,
    balance: 440000,
  },
  {
    id: 'cf-3',
    date: '2025-10-05',
    type: 'Inflow',
    category: 'Services',
    description: 'Consulting payment - Acme Corp',
    amount: 45000,
    balance: 485000,
    source: 'ACH',
  },
  {
    id: 'cf-4',
    date: '2025-10-07',
    type: 'Outflow',
    category: 'Operating Expenses',
    description: 'Monthly software & tools',
    amount: 2500,
    balance: 482500,
  },
];

// Cash Flow Forecast
const cashFlowForecast: CashFlowForecast[] = [
  {
    month: '2025-11',
    beginningBalance: 482500,
    expectedInflows: 115000,
    expectedOutflows: 68000,
    endingBalance: 529500,
    runway: 18,
  },
  {
    month: '2025-12',
    beginningBalance: 529500,
    expectedInflows: 125000,
    expectedOutflows: 72000,
    endingBalance: 582500,
    runway: 19,
  },
  {
    month: '2026-01',
    beginningBalance: 582500,
    expectedInflows: 130000,
    expectedOutflows: 75000,
    endingBalance: 637500,
    runway: 20,
  },
];

// Financial Metrics
const financialMetrics: FinancialMetrics = {
  cash: 482500,
  totalRevenue: 540000,
  mrr: 35000,
  arr: 420000,
  grossMargin: 75.5,
  netMargin: 28.7,
  burnRate: 15000,
  runway: 18,
  cac: 8500,
  ltv: 95000,
  ltvCacRatio: 11.2,
  outstandingAR: 63000,
  outstandingAP: 12000,
};

// Helper functions
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Export getters
export function getEquityHolders() {
  return clone(equityHolders);
}

export function getInvoices() {
  return clone(invoices);
}

export function getSubscriptions() {
  return clone(subscriptions);
}

export function getExpenses() {
  return clone(expenses);
}

export function getProfitLoss() {
  return clone(profitLoss);
}

export function getCashFlow() {
  return clone(cashFlow);
}

export function getCashFlowForecast() {
  return clone(cashFlowForecast);
}

export function getFinancialMetrics() {
  return clone(financialMetrics);
}

// CRUD operations (for future expansion)
export function createInvoice(invoice: Omit<Invoice, 'id'>) {
  const newInvoice = { ...invoice, id: `inv-${Date.now()}` };
  invoices.push(newInvoice);
  return clone(newInvoice);
}

export function updateInvoice(id: string, updates: Partial<Invoice>) {
  const index = invoices.findIndex((inv) => inv.id === id);
  if (index === -1) return null;
  invoices[index] = { ...invoices[index], ...updates };
  return clone(invoices[index]);
}

export function createSubscription(subscription: Omit<Subscription, 'id'>) {
  const newSub = { ...subscription, id: `sub-${Date.now()}` };
  subscriptions.push(newSub);
  return clone(newSub);
}

export function updateSubscription(id: string, updates: Partial<Subscription>) {
  const index = subscriptions.findIndex((sub) => sub.id === id);
  if (index === -1) return null;
  subscriptions[index] = { ...subscriptions[index], ...updates };
  return clone(subscriptions[index]);
}

export function createExpense(expense: Omit<Expense, 'id'>) {
  const newExpense = { ...expense, id: `exp-${Date.now()}` };
  expenses.push(newExpense);
  return clone(newExpense);
}
