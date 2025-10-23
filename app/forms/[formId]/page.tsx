import { notFound } from 'next/navigation'
import PublicFormClient from './PublicFormClient'

// Define available public forms
const publicForms = {
  'clarity-intake': {
    id: 'clarity-intake',
    title: 'Revenue Clarity - Future Client',
    description: 'Help us understand your revenue challenges so we can deliver maximum impact.',
    fields: [
      // Required Fields Only
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'contactName', label: 'Your Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'contactEmail', label: 'Email', type: 'email', required: true, placeholder: 'john@acme.com' },
      { name: 'contactPhone', label: 'Phone', type: 'tel', required: true, placeholder: '+1 (555) 123-4567' },
      { name: 'monthlyRevenue', label: 'Current Monthly Revenue ($)', type: 'number', required: true, placeholder: '50000' },

      // Optional Fields with Dropdowns
      { name: 'industry', label: 'Industry', type: 'select', required: false, options: ['B2B SaaS', 'E-commerce', 'Consulting/Services', 'Manufacturing', 'Healthcare', 'Finance', 'Education', 'Real Estate', 'Marketing/Advertising', 'Technology', 'Retail', 'Other'] },
      { name: 'teamSize', label: 'Team Size', type: 'select', required: false, options: ['Just me (solo)', '2-5 people', '6-10 people', '11-25 people', '26-50 people', '51-100 people', '100+ people'] },
      { name: 'painPoints', label: 'What are your top revenue challenges?', type: 'select', required: false, options: ['High churn rate', 'Low conversion rates', 'Pricing confusion', 'Sales cycle too long', 'Customer acquisition cost too high', 'Poor retention', 'Inconsistent revenue', 'Scaling challenges', 'Market saturation', 'Other'] },
      { name: 'tried', label: 'What have you already tried?', type: 'select', required: false, options: ['Hired consultants', 'Changed pricing', 'New marketing campaigns', 'CRM implementation', 'Sales training', 'Product changes', 'Customer success program', 'Nothing yet', 'Other'] },
      { name: 'goals', label: 'Primary revenue goal for next 12 months', type: 'select', required: false, options: ['Double revenue', 'Increase 50%', 'Increase 25%', 'Achieve consistent MRR', 'Reduce churn by 50%', 'Improve margins', 'Scale to $1M ARR', 'Scale to $5M ARR', 'Other'] },
      { name: 'timeline', label: 'When do you need to see results?', type: 'select', required: false, options: ['ASAP (30 days)', '60 days', '90 days', 'Next quarter', 'Within 6 months', 'Flexible'] },
      { name: 'budget', label: 'Budget range for this engagement', type: 'select', required: false, options: ['$3,500-$10k', '$10k-$25k', '$25k-$50k', '$50k-$100k', '$100k+', 'Not sure yet'] },
      { name: 'dataAccess', label: 'What systems do you use?', type: 'select', required: false, options: ['HubSpot', 'Salesforce', 'Google Analytics', 'Stripe/Payment processor', 'QuickBooks/Accounting', 'Custom CRM', 'Excel/Spreadsheets', 'Multiple systems', 'None yet', 'Other'] },
      { name: 'urgency', label: 'How urgent is solving these challenges?', type: 'select', required: false, options: ['Extremely urgent (1-2 weeks)', 'Very urgent (1 month)', 'Urgent (2-3 months)', 'Moderate (3-6 months)', 'Not urgent, exploring options'] },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },

      // Optional text area for additional details
      { name: 'blockers', label: 'Additional notes or specific challenges (optional)', type: 'textarea', required: false, placeholder: 'Share any additional context that would help us understand your situation...', rows: 3 },
    ],
  },
  'blueprint-intake': {
    id: 'blueprint-intake',
    title: 'Revenue Blueprint - Project Intake',
    description: 'Share your context so we can design a custom revenue strategy.',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'contactName', label: 'Your Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'contactEmail', label: 'Email', type: 'email', required: true, placeholder: 'john@acme.com' },
      { name: 'contactPhone', label: 'Phone', type: 'tel', required: false, placeholder: '+1 (555) 123-4567' },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },
      { name: 'industry', label: 'Industry', type: 'text', required: true, placeholder: 'B2B SaaS, E-commerce, etc.' },
      { name: 'monthlyRevenue', label: 'Current Monthly Revenue ($)', type: 'number', required: true, placeholder: '50000' },
      { name: 'targetRevenue', label: 'Target Monthly Revenue ($)', type: 'number', required: true, placeholder: '100000' },
      { name: 'timeline', label: 'Desired Timeline', type: 'select', required: true, options: ['30 days', '60 days', '90 days', '6 months'] },
      { name: 'challenges', label: 'Key Revenue Challenges', type: 'textarea', required: true, placeholder: 'Describe your main revenue bottlenecks...' },
      { name: 'assets', label: 'Existing Assets/Data', type: 'textarea', required: false, placeholder: 'List any existing data, tools, or resources...' },
      { name: 'budget', label: 'Budget Range', type: 'select', required: true, options: ['$10k-$25k', '$25k-$50k', '$50k+', 'Not sure yet'] },
    ],
  },
  'growth-systems-gap': {
    id: 'growth-systems-gap',
    title: 'Growth Systems - Finding the Gap',
    description: 'Help us identify gaps in your growth systems and unlock new revenue potential.',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'contactName', label: 'Your Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'contactEmail', label: 'Email', type: 'email', required: true, placeholder: 'john@acme.com' },
      { name: 'contactPhone', label: 'Phone', type: 'tel', required: false, placeholder: '+1 (555) 123-4567' },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },
      { name: 'industry', label: 'Industry', type: 'text', required: true, placeholder: 'B2B SaaS, E-commerce, etc.' },
      { name: 'monthlyRevenue', label: 'Current Monthly Revenue ($)', type: 'number', required: true, placeholder: '50000' },
      { name: 'teamSize', label: 'Team Size', type: 'number', required: false, placeholder: '25' },
      { name: 'currentSystems', label: 'What growth systems do you currently have in place?', type: 'textarea', required: true, placeholder: 'e.g., CRM, marketing automation, sales processes, analytics...' },
      { name: 'systemGaps', label: 'Where do you feel your systems are falling short?', type: 'textarea', required: true, placeholder: 'Describe specific areas where your systems aren\'t delivering results...' },
      { name: 'growthGoals', label: 'What are your top 3 growth goals for the next 12 months?', type: 'textarea', required: true, placeholder: 'Be specific: revenue targets, customer acquisition, market expansion...' },
      { name: 'blockers', label: 'What\'s currently blocking your growth?', type: 'textarea', required: true, placeholder: 'List technical, operational, or strategic obstacles...' },
      { name: 'dataAccess', label: 'What data/systems can you provide access to?', type: 'textarea', required: true, placeholder: 'CRM, analytics, marketing platforms, sales data...' },
      { name: 'timeline', label: 'When do you need to see results?', type: 'select', required: true, options: ['ASAP (30 days)', '60 days', '90 days', 'Next quarter', 'Within 6 months'] },
      { name: 'budget', label: 'What\'s your budget range for this engagement?', type: 'select', required: true, options: ['$10k-$25k', '$25k-$50k', '$50k-$100k', '$100k+', 'Not sure yet'] },
      { name: 'urgency', label: 'How urgent is fixing these growth gaps? (1-10)', type: 'number', required: true, placeholder: '8', min: 1, max: 10 },
    ],
  },
  'fundraising-gap': {
    id: 'fundraising-gap',
    title: 'FundraisingOS - Finding the Gap',
    description: 'Identify what\'s missing in your fundraising strategy to close your next round successfully.',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'contactName', label: 'Your Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'contactEmail', label: 'Email', type: 'email', required: true, placeholder: 'john@acme.com' },
      { name: 'contactPhone', label: 'Phone', type: 'tel', required: false, placeholder: '+1 (555) 123-4567' },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },
      { name: 'industry', label: 'Industry', type: 'text', required: true, placeholder: 'B2B SaaS, E-commerce, etc.' },
      { name: 'monthlyRevenue', label: 'Current Monthly Revenue ($)', type: 'number', required: true, placeholder: '50000' },
      { name: 'fundingStage', label: 'What funding stage are you pursuing?', type: 'select', required: true, options: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series B+', 'Bridge Round'] },
      { name: 'targetRaise', label: 'Target Raise Amount ($)', type: 'number', required: true, placeholder: '1000000' },
      { name: 'previousRounds', label: 'Have you raised capital before? If so, how much?', type: 'textarea', required: true, placeholder: 'e.g., Raised $500k in pre-seed from angels...' },
      { name: 'fundraisingChallenges', label: 'What are your top 3 fundraising challenges right now?', type: 'textarea', required: true, placeholder: 'e.g., Weak metrics, unclear story, lack of investor pipeline...' },
      { name: 'currentMetrics', label: 'What are your current key metrics?', type: 'textarea', required: true, placeholder: 'ARR, growth rate, CAC, LTV, burn rate, runway...' },
      { name: 'investorConversations', label: 'How many investor conversations have you had?', type: 'number', required: true, placeholder: '10' },
      { name: 'deckReady', label: 'Do you have a pitch deck ready?', type: 'select', required: true, options: ['Yes, fully ready', 'Yes, needs refinement', 'In progress', 'Not started'] },
      { name: 'timeline', label: 'When do you need to close this round?', type: 'select', required: true, options: ['Within 1 month', '1-3 months', '3-6 months', '6-12 months'] },
      { name: 'budget', label: 'What\'s your budget for fundraising support?', type: 'select', required: true, options: ['$10k-$25k', '$25k-$50k', '$50k-$100k', '$100k+', 'Not sure yet'] },
      { name: 'urgency', label: 'How urgent is closing this round? (1-10)', type: 'number', required: true, placeholder: '9', min: 1, max: 10 },
    ],
  },
  'revenueos-detailed': {
    id: 'revenueos-detailed',
    title: 'RevenueOS - Let\'s Get Detailed',
    description: 'Deep dive into your revenue operations to build a comprehensive revenue optimization system.',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'contactName', label: 'Your Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'contactEmail', label: 'Email', type: 'email', required: true, placeholder: 'john@acme.com' },
      { name: 'contactPhone', label: 'Phone', type: 'tel', required: false, placeholder: '+1 (555) 123-4567' },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },
      { name: 'industry', label: 'Industry', type: 'text', required: true, placeholder: 'B2B SaaS, E-commerce, etc.' },
      { name: 'monthlyRevenue', label: 'Current Monthly Revenue ($)', type: 'number', required: true, placeholder: '50000' },
      { name: 'teamSize', label: 'Team Size', type: 'number', required: true, placeholder: '25' },
      { name: 'revenueModel', label: 'What\'s your primary revenue model?', type: 'select', required: true, options: ['Subscription (SaaS)', 'Transaction-based', 'Marketplace', 'E-commerce', 'Services', 'Hybrid'] },
      { name: 'currentMetrics', label: 'Share your current key metrics', type: 'textarea', required: true, placeholder: 'MRR/ARR, churn rate, ARPU, conversion rates, CAC, LTV...' },
      { name: 'revenueFunnel', label: 'Describe your revenue funnel from awareness to renewal', type: 'textarea', required: true, placeholder: 'Walk us through your customer journey and conversion points...' },
      { name: 'biggestLeaks', label: 'Where are the biggest revenue leaks in your funnel?', type: 'textarea', required: true, placeholder: 'Identify specific stages where you lose customers or revenue...' },
      { name: 'systemsStack', label: 'What systems/tools do you use for revenue operations?', type: 'textarea', required: true, placeholder: 'CRM, billing, analytics, marketing automation, customer success...' },
      { name: 'dataQuality', label: 'How would you rate your data quality? (1-10)', type: 'number', required: true, placeholder: '7', min: 1, max: 10 },
      { name: 'revenueGoals', label: 'What are your revenue goals for the next 12-24 months?', type: 'textarea', required: true, placeholder: 'Specific targets, growth rates, new revenue streams...' },
      { name: 'tried', label: 'What have you already tried to optimize revenue?', type: 'textarea', required: true, placeholder: 'List strategies, experiments, tools you\'ve implemented...' },
      { name: 'timeline', label: 'When do you need to see results?', type: 'select', required: true, options: ['ASAP (30 days)', '60 days', '90 days', 'Next quarter', 'Within 6 months'] },
      { name: 'budget', label: 'What\'s your budget range for this engagement?', type: 'select', required: true, options: ['$25k-$50k', '$50k-$100k', '$100k-$250k', '$250k+', 'Not sure yet'] },
      { name: 'urgency', label: 'How urgent is optimizing your revenue operations? (1-10)', type: 'number', required: true, placeholder: '8', min: 1, max: 10 },
    ],
  },
  'revenue-health-diagnostic': {
    id: 'revenue-health-diagnostic',
    title: 'Revenue Health Diagnostic (RHD)',
    description: 'Comprehensive diagnostic aggregating financial, CRM, ERP, and operational data to identify all profit drains and margin risks.',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'contactName', label: 'Your Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'contactEmail', label: 'Email', type: 'email', required: true, placeholder: 'john@acme.com' },
      { name: 'contactPhone', label: 'Phone', type: 'tel', required: false, placeholder: '+1 (555) 123-4567' },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },
      { name: 'industry', label: 'Industry', type: 'text', required: true, placeholder: 'B2B SaaS, E-commerce, etc.' },
      { name: 'annualRevenue', label: 'Annual Revenue ($)', type: 'number', required: true, placeholder: '1000000' },
      { name: 'monthlyRevenue', label: 'Monthly Recurring Revenue ($)', type: 'number', required: true, placeholder: '83333' },
      { name: 'grossMargin', label: 'Current Gross Margin (%)', type: 'number', required: true, placeholder: '70' },
      { name: 'financialSystems', label: 'Financial Systems in Use', type: 'textarea', required: true, placeholder: 'QuickBooks, Stripe, accounting software...' },
      { name: 'crmSystem', label: 'CRM System', type: 'text', required: true, placeholder: 'Salesforce, HubSpot, Pipedrive...' },
      { name: 'erpSystem', label: 'ERP/Operations System', type: 'text', required: false, placeholder: 'NetSuite, SAP, custom solution...' },
      { name: 'knownLeaks', label: 'Known Revenue Leaks or Margin Risks', type: 'textarea', required: true, placeholder: 'High churn, pricing erosion, operational inefficiencies...' },
      { name: 'dataAccess', label: 'What data/systems can you provide access to?', type: 'textarea', required: true, placeholder: 'Financial reports, CRM exports, operational dashboards...' },
      { name: 'dataQuality', label: 'Rate your current data quality (1-10)', type: 'number', required: true, placeholder: '7', min: 1, max: 10 },
      { name: 'diagnosticGoals', label: 'What do you hope to discover from this diagnostic?', type: 'textarea', required: true, placeholder: 'Hidden profit drains, margin optimization opportunities, system inefficiencies...' },
      { name: 'urgency', label: 'How urgent is this diagnostic? (1-10)', type: 'number', required: true, placeholder: '8', min: 1, max: 10 },
    ],
  },
  'roi-prioritization': {
    id: 'roi-prioritization',
    title: 'ROI Prioritization Matrix',
    description: 'Convert diagnostic findings into a dollar-based prioritization matrix ranking interventions by financial impact, speed, and automation ease.',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'contactName', label: 'Your Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'contactEmail', label: 'Email', type: 'email', required: true, placeholder: 'john@acme.com' },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },
      { name: 'identifiedOpportunities', label: 'List all identified revenue opportunities from diagnostic', type: 'textarea', required: true, placeholder: 'List each opportunity on a new line with estimated impact...' },
      { name: 'currentPriorities', label: 'What are your current top 3 priorities?', type: 'textarea', required: true, placeholder: 'Reducing churn, improving pricing, increasing upsells...' },
      { name: 'resourceConstraints', label: 'What resource constraints do you face?', type: 'textarea', required: true, placeholder: 'Limited dev resources, budget constraints, time to market...' },
      { name: 'quickWins', label: 'Which opportunities would be easiest to implement?', type: 'textarea', required: true, placeholder: 'Price increases, email campaigns, contract changes...' },
      { name: 'bigBets', label: 'Which opportunities have the highest potential impact?', type: 'textarea', required: true, placeholder: 'New pricing model, retention program, expansion strategy...' },
      { name: 'automationReadiness', label: 'Rate your readiness for automation (1-10)', type: 'number', required: true, placeholder: '6', min: 1, max: 10 },
      { name: 'desiredTimeline', label: 'Desired timeline for implementation', type: 'select', required: true, options: ['30 days', '60 days', '90 days', 'Next quarter', '6 months'] },
      { name: 'successMetrics', label: 'How will you measure success?', type: 'textarea', required: true, placeholder: 'Revenue increase, margin improvement, churn reduction, efficiency gains...' },
    ],
  },
  'trs-score-intake': {
    id: 'trs-score-intake',
    title: 'TRS Score Intake',
    description: 'Collect detailed performance metrics to generate your quantitative TRS Score tracking improvement across engagements.',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'contactName', label: 'Your Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'contactEmail', label: 'Email', type: 'email', required: true, placeholder: 'john@acme.com' },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },
      { name: 'submissionQuarter', label: 'Submission Quarter', type: 'select', required: true, options: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'] },
      { name: 'arr', label: 'Annual Recurring Revenue (ARR) ($)', type: 'number', required: true, placeholder: '1000000' },
      { name: 'grossMargin', label: 'Gross Margin (%)', type: 'number', required: true, placeholder: '75' },
      { name: 'netMargin', label: 'Net Margin (%)', type: 'number', required: true, placeholder: '20' },
      { name: 'churnRate', label: 'Monthly Churn Rate (%)', type: 'number', required: true, placeholder: '5', step: '0.1' },
      { name: 'salesCycle', label: 'Average Sales Cycle (days)', type: 'number', required: true, placeholder: '45' },
      { name: 'expansionRate', label: 'Net Revenue Retention / Expansion Rate (%)', type: 'number', required: true, placeholder: '110' },
      { name: 'cac', label: 'Customer Acquisition Cost (CAC) ($)', type: 'number', required: true, placeholder: '5000' },
      { name: 'ltv', label: 'Lifetime Value (LTV) ($)', type: 'number', required: true, placeholder: '50000' },
      { name: 'ltvCacRatio', label: 'LTV:CAC Ratio', type: 'number', required: true, placeholder: '10', step: '0.1' },
      { name: 'leadershipAlignment', label: 'Rate leadership alignment on revenue strategy (1-10)', type: 'number', required: true, placeholder: '8', min: 1, max: 10 },
      { name: 'dataInfrastructure', label: 'Rate your data infrastructure quality (1-10)', type: 'number', required: true, placeholder: '7', min: 1, max: 10 },
      { name: 'improvementAreas', label: 'What areas need the most improvement?', type: 'textarea', required: true, placeholder: 'List key areas for focus...' },
    ],
  },
  'gap-map-update': {
    id: 'gap-map-update',
    title: 'Gap Map Update',
    description: 'Update identified leaks or opportunities post-audit to ensure every system intervention is logged, owned, and quantified.',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'analystName', label: 'Analyst Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'analystEmail', label: 'Analyst Email', type: 'email', required: true, placeholder: 'analyst@trsrevenue.com' },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },
      { name: 'updateDate', label: 'Update Date', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
      { name: 'interventionType', label: 'Intervention Type', type: 'select', required: true, options: ['Pricing', 'Retention', 'Activation', 'Expansion', 'Acquisition', 'Operations', 'Other'] },
      { name: 'gapIdentified', label: 'Gap/Leak Identified', type: 'textarea', required: true, placeholder: 'Describe the specific revenue leak or opportunity...' },
      { name: 'quantifiedImpact', label: 'Quantified Financial Impact ($)', type: 'number', required: true, placeholder: '50000' },
      { name: 'owner', label: 'Owner (Person Responsible)', type: 'text', required: true, placeholder: 'Name or role' },
      { name: 'status', label: 'Current Status', type: 'select', required: true, options: ['Identified', 'In Progress', 'Implemented', 'Validated', 'Closed'] },
      { name: 'implementationPlan', label: 'Implementation Plan', type: 'textarea', required: true, placeholder: 'Specific steps to address this gap...' },
      { name: 'timeline', label: 'Expected Timeline', type: 'select', required: true, options: ['1-2 weeks', '2-4 weeks', '1-2 months', '2-3 months', '3+ months'] },
      { name: 'dependencies', label: 'Dependencies or Blockers', type: 'textarea', required: false, placeholder: 'Technical requirements, resource needs, external factors...' },
      { name: 'notes', label: 'Additional Notes', type: 'textarea', required: false, placeholder: 'Any additional context or observations...' },
    ],
  },
  'implementation-qa': {
    id: 'implementation-qa',
    title: 'Implementation QA Checklist',
    description: 'Confirm blueprints were installed correctly, KPIs connected to dashboards, and enablement assets delivered.',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'implementerName', label: 'Implementer Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'implementerEmail', label: 'Implementer Email', type: 'email', required: true, placeholder: 'implementer@trsrevenue.com' },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },
      { name: 'completionDate', label: 'Implementation Completion Date', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
      { name: 'blueprintDeployed', label: 'Revenue Blueprint Deployed Successfully?', type: 'select', required: true, options: ['Yes', 'No', 'Partial'] },
      { name: 'kpiDashboard', label: 'KPI Dashboard Connected to Live Data?', type: 'select', required: true, options: ['Yes', 'No', 'In Progress'] },
      { name: 'enablementAssets', label: 'Client Enablement Assets Delivered?', type: 'select', required: true, options: ['All Delivered', 'Partial', 'Not Yet'] },
      { name: 'loomVideos', label: 'Loom Training Videos Created?', type: 'select', required: true, options: ['Yes', 'No', 'Not Required'] },
      { name: 'checklistsDelivered', label: 'Operational Checklists Delivered?', type: 'select', required: true, options: ['Yes', 'No', 'Not Required'] },
      { name: 'clientTrained', label: 'Client Team Trained on System?', type: 'select', required: true, options: ['Fully Trained', 'Partially Trained', 'Training Scheduled'] },
      { name: 'systemsIntegrated', label: 'All Required Systems Integrated?', type: 'select', required: true, options: ['Yes', 'No', 'Partial'] },
      { name: 'dataValidation', label: 'Data Validation Completed?', type: 'select', required: true, options: ['Yes', 'No', 'In Progress'] },
      { name: 'issuesEncountered', label: 'Issues Encountered During Implementation', type: 'textarea', required: false, placeholder: 'List any blockers, bugs, or challenges...' },
      { name: 'outstandingItems', label: 'Outstanding Items', type: 'textarea', required: false, placeholder: 'What still needs to be completed?' },
      { name: 'signoffReceived', label: 'Client Sign-Off Received?', type: 'select', required: true, options: ['Yes', 'No', 'Pending'] },
    ],
  },
  'quarterly-roi-review': {
    id: 'quarterly-roi-review',
    title: 'Quarterly ROI Review',
    description: 'Summarize uplift, benchmark progress, and feed future case studies connecting with TRS Score and RevBoard analytics.',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'reviewerName', label: 'Reviewer Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'reviewerEmail', label: 'Reviewer Email', type: 'email', required: true, placeholder: 'reviewer@trsrevenue.com' },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },
      { name: 'reviewQuarter', label: 'Review Quarter', type: 'select', required: true, options: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'] },
      { name: 'baselineRevenue', label: 'Baseline Revenue at Engagement Start ($)', type: 'number', required: true, placeholder: '1000000' },
      { name: 'currentRevenue', label: 'Current Revenue ($)', type: 'number', required: true, placeholder: '1200000' },
      { name: 'revenueUplift', label: 'Total Revenue Uplift ($)', type: 'number', required: true, placeholder: '200000' },
      { name: 'upliftPercentage', label: 'Uplift Percentage (%)', type: 'number', required: true, placeholder: '20' },
      { name: 'baselineTRSScore', label: 'Baseline TRS Score', type: 'number', required: true, placeholder: '65' },
      { name: 'currentTRSScore', label: 'Current TRS Score', type: 'number', required: true, placeholder: '82' },
      { name: 'keyWins', label: 'Key Wins This Quarter', type: 'textarea', required: true, placeholder: 'List major accomplishments and improvements...' },
      { name: 'interventionsImplemented', label: 'Interventions Implemented', type: 'textarea', required: true, placeholder: 'Pricing changes, retention programs, automation deployed...' },
      { name: 'metricsImproved', label: 'Metrics Improved', type: 'textarea', required: true, placeholder: 'Churn reduction, margin expansion, sales cycle improvement...' },
      { name: 'challenges', label: 'Challenges Faced', type: 'textarea', required: false, placeholder: 'Obstacles, delays, or unexpected issues...' },
      { name: 'nextQuarterPlan', label: 'Plan for Next Quarter', type: 'textarea', required: true, placeholder: 'Priorities, new initiatives, optimization areas...' },
      { name: 'caseStudyReady', label: 'Ready for Case Study?', type: 'select', required: true, options: ['Yes', 'No', 'With Edits'] },
      { name: 'testimonialAvailable', label: 'Client Testimonial Available?', type: 'select', required: true, options: ['Yes', 'No', 'Requested'] },
    ],
  },
  'revfoundry-intake': {
    id: 'revfoundry-intake',
    title: 'RevFoundry Intake - Launch Your Startup',
    description: 'Launch or scale your startup with The Revenue Scientists. Get revenue systems, CRM setup, and growth infrastructure in 90 days.',
    fields: [
      // Section 1: Basic Info
      { name: 'contactName', label: 'Your Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'contactEmail', label: 'Email Address', type: 'email', required: true, placeholder: 'john@company.com' },
      { name: 'contactPhone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+1 (555) 123-4567' },
      { name: 'companyName', label: 'Company Name (if exists)', type: 'text', required: false, placeholder: 'Your Company Inc.' },
      { name: 'website', label: 'Website', type: 'url', required: false, placeholder: 'https://yourcompany.com' },
      { name: 'socialLinks', label: 'Social Links (LinkedIn, Twitter, etc.)', type: 'textarea', required: false, placeholder: 'LinkedIn: linkedin.com/in/yourprofile\nTwitter: @yourhandle', rows: 2 },

      // Section 2: Idea Snapshot
      { name: 'productDescription', label: 'Describe your product or service in one sentence', type: 'text', required: true, placeholder: 'We help small businesses automate their invoicing and get paid faster' },
      { name: 'problemSolved', label: 'What problem does it solve?', type: 'textarea', required: true, placeholder: 'Describe the specific pain point your product addresses...', rows: 3 },
      { name: 'idealCustomer', label: 'Who is your ideal customer?', type: 'textarea', required: true, placeholder: 'Be specific: industry, company size, role, location, budget, etc.', rows: 3 },
      { name: 'deliveryMethod', label: 'How do you plan to deliver it?', type: 'select', required: true, options: ['Digital (SaaS, software, online service)', 'Physical (product, retail, hardware)', 'Hybrid (combination of digital and physical)', 'Service-based (consulting, agency, professional services)'] },

      // Section 3: Current Stage
      { name: 'businessStage', label: 'Current Stage', type: 'select', required: true, options: ['Idea Only — Concept stage, no product built yet', 'Prototype / MVP — Built something, testing with early users', 'Already Selling — Making sales, but inconsistent', 'Generating Consistent Revenue — Predictable sales, ready to scale'] },
      { name: 'currentRevenue', label: 'Current Monthly Revenue (if any)', type: 'text', required: false, placeholder: '$0, $500, $5,000, etc.' },
      { name: 'teamSize', label: 'Team Size (including you)', type: 'select', required: true, options: ['Solo founder', '2-3 people', '4-5 people', '6-10 people', '10+ people'] },

      // Section 4: Goals
      { name: 'ninetyDayOutcome', label: 'Desired outcome in 90 days', type: 'textarea', required: true, placeholder: 'Example: Launch MVP and get first 10 paying customers, or Scale from $5K to $15K MRR with systems in place', rows: 3 },
      { name: 'targetRevenue', label: 'Target Monthly Revenue (90 days from now)', type: 'text', required: true, placeholder: '$5,000, $10,000, $25,000, etc.' },
      { name: 'biggestChallenge', label: 'Biggest challenge right now', type: 'textarea', required: true, placeholder: 'What\'s blocking your growth? Be specific about obstacles, gaps, or bottlenecks...', rows: 3 },
      { name: 'triedBefore', label: 'What have you tried so far?', type: 'textarea', required: false, placeholder: 'Any tools, strategies, or approaches you\'ve tested? What worked or didn\'t work?', rows: 2 },

      // Section 5: Systems & Data
      { name: 'currentTools', label: 'Current CRM, ad platforms, or analytics tools', type: 'textarea', required: false, placeholder: 'Examples: HubSpot, Salesforce, Google Analytics, Facebook Ads, Mailchimp, etc.', rows: 3 },
      { name: 'dataAccess', label: 'Can you provide access or links to relevant data?', type: 'textarea', required: false, placeholder: 'Share links to dashboards, reports, or indicate if you can grant access to tools. Not required but helps us understand your current state.', rows: 2 },
      { name: 'techComfort', label: 'Technical Comfort Level', type: 'select', required: true, options: ['Non-technical — Need full setup and training', 'Somewhat technical — Can learn new tools with guidance', 'Very technical — Comfortable with SaaS and automation'] },

      // Section 6: Engagement Preference
      { name: 'engagementModel', label: 'Preferred Engagement Model (select all that apply)', type: 'textarea', required: true, placeholder: 'Cash Build ($15K), Equity Advisory (3-5%), RevAdvance Financing, or Not sure yet', rows: 2 },
      { name: 'budget', label: 'Available Budget (if choosing Cash Build)', type: 'text', required: false, placeholder: 'e.g., $15K, $20K, flexible' },
      { name: 'timeline', label: 'When do you want to start?', type: 'select', required: true, options: ['Immediately — Ready to start within 1-2 weeks', 'This month — Ready within 2-4 weeks', 'Next month — Planning ahead', 'Just exploring — Gathering information'] },
      { name: 'additionalNotes', label: 'Anything else we should know?', type: 'textarea', required: false, placeholder: 'Additional context, questions, or specific needs...', rows: 3 },
      { name: 'referralSource', label: 'Where did you hear about us?', type: 'select', required: false, options: ['Google Search', 'LinkedIn', 'Referral from friend/colleague', 'Twitter/X', 'Podcast', 'Conference/Event', 'Blog/Article', 'Other'] },
    ],
  },
}

type PublicFormPageProps = {
  params: Promise<{ formId: string }>
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { formId } = await params
  const formConfig = publicForms[formId as keyof typeof publicForms]

  if (!formConfig) {
    notFound()
  }

  return <PublicFormClient formConfig={formConfig} />
}

// Generate static params for known forms
export function generateStaticParams() {
  return Object.keys(publicForms).map((formId) => ({
    formId,
  }))
}
