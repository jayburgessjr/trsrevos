// Equity & Cap Table Types
export type EquityType = 'Common Stock' | 'Preferred Stock' | 'Options' | 'Warrant' | 'SAFE' | 'Convertible Note';

export type EquityHolder = {
  id: string;
  name: string;
  holderType: 'Founder' | 'Investor' | 'Employee' | 'Advisor' | 'Entity';
  equityType: EquityType;
  shares: number;
  percentage: number;
  valueAtCurrent: number;
  investmentDate: string;
  vestingSchedule?: {
    totalShares: number;
    vestedShares: number;
    vestingStartDate: string;
    cliffMonths: number;
    vestingMonths: number;
  };
  notes?: string;
};

// Billing & Invoices Types
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
export type PaymentTerm = 'Due on Receipt' | 'Net 15' | 'Net 30' | 'Net 60' | 'Net 90';

export type Invoice = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  amount: number;
  tax: number;
  total: number;
  paymentTerm: PaymentTerm;
  lineItems: InvoiceLineItem[];
  notes?: string;
};

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

// Subscription & Recurring Revenue Types
export type BillingFrequency = 'Monthly' | 'Quarterly' | 'Annually' | 'One-time';
export type SubscriptionStatus = 'Active' | 'Paused' | 'Cancelled' | 'Trial' | 'Past Due';

export type Subscription = {
  id: string;
  clientId: string;
  clientName: string;
  productName: string;
  status: SubscriptionStatus;
  mrr: number;
  arr: number;
  billingFrequency: BillingFrequency;
  startDate: string;
  renewalDate: string;
  nextBillingDate: string;
  contractValue: number;
  paymentMethod?: string;
  autoRenew: boolean;
  notes?: string;
};

// Expenses & P&L Types
export type ExpenseCategory =
  | 'Payroll & Benefits'
  | 'Marketing & Advertising'
  | 'Software & Tools'
  | 'Office & Equipment'
  | 'Travel & Entertainment'
  | 'Professional Services'
  | 'Hosting & Infrastructure'
  | 'Other';

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  vendor: string;
  description: string;
  amount: number;
  recurring: boolean;
  recurringFrequency?: BillingFrequency;
  approved: boolean;
  approvedBy?: string;
  receiptUrl?: string;
  notes?: string;
};

export type ProfitLoss = {
  period: string;
  revenue: {
    subscriptions: number;
    services: number;
    other: number;
    total: number;
  };
  expenses: {
    payroll: number;
    marketing: number;
    software: number;
    office: number;
    travel: number;
    professional: number;
    hosting: number;
    other: number;
    total: number;
  };
  netIncome: number;
  profitMargin: number;
};

// Cash Flow Types
export type CashFlowEntry = {
  id: string;
  date: string;
  type: 'Inflow' | 'Outflow';
  category: string;
  description: string;
  amount: number;
  balance: number;
  source?: string;
};

export type CashFlowForecast = {
  month: string;
  beginningBalance: number;
  expectedInflows: number;
  expectedOutflows: number;
  endingBalance: number;
  runway: number; // months
};

// Financial Metrics
export type FinancialMetrics = {
  cash: number;
  totalRevenue: number;
  mrr: number;
  arr: number;
  grossMargin: number;
  netMargin: number;
  burnRate: number;
  runway: number;
  cac: number; // Customer Acquisition Cost
  ltv: number; // Lifetime Value
  ltvCacRatio: number;
  outstandingAR: number; // Accounts Receivable
  outstandingAP: number; // Accounts Payable
};
