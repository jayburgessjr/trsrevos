import { notFound } from 'next/navigation'
import PublicFormClient from './PublicFormClient'

// Define available public forms
const publicForms = {
  'clarity-intake': {
    id: 'clarity-intake',
    title: 'Clarity Audit - Client Intake',
    description: 'Help us understand your revenue challenges so we can deliver maximum impact.',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
      { name: 'contactName', label: 'Your Name', type: 'text', required: true, placeholder: 'John Smith' },
      { name: 'contactEmail', label: 'Email', type: 'email', required: true, placeholder: 'john@acme.com' },
      { name: 'contactPhone', label: 'Phone', type: 'tel', required: false, placeholder: '+1 (555) 123-4567' },
      { name: 'industry', label: 'Industry', type: 'text', required: true, placeholder: 'B2B SaaS, E-commerce, etc.' },
      { name: 'monthlyRevenue', label: 'Current Monthly Revenue ($)', type: 'number', required: true, placeholder: '50000' },
      { name: 'teamSize', label: 'Team Size', type: 'number', required: false, placeholder: '25' },
      { name: 'painPoints', label: 'What are your top 3 revenue challenges right now?', type: 'textarea', required: true, placeholder: 'e.g., High churn rate, low conversion, pricing confusion...' },
      { name: 'tried', label: 'What have you already tried to fix these challenges?', type: 'textarea', required: true, placeholder: 'List any strategies, tools, or tactics you\'ve implemented...' },
      { name: 'goals', label: 'What revenue goals do you want to achieve in the next 12 months?', type: 'textarea', required: true, placeholder: 'Be specific: revenue targets, growth %, customer acquisition goals...' },
      { name: 'timeline', label: 'When do you need to see results?', type: 'select', required: true, options: ['ASAP (30 days)', '60 days', '90 days', 'Next quarter', 'Within 6 months'] },
      { name: 'budget', label: 'What\'s your budget range for this engagement?', type: 'select', required: true, options: ['$3,500-$10k', '$10k-$25k', '$25k-$50k', '$50k+', 'Not sure yet'] },
      { name: 'dataAccess', label: 'What data/systems can you provide access to?', type: 'textarea', required: true, placeholder: 'CRM, analytics, billing platform, customer data...' },
      { name: 'blockers', label: 'What might prevent you from implementing our recommendations?', type: 'textarea', required: false, placeholder: 'Technical constraints, team bandwidth, budget limits...' },
      { name: 'urgency', label: 'How urgent is solving these revenue challenges? (1-10)', type: 'number', required: true, placeholder: '8', min: 1, max: 10 },
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
      { name: 'industry', label: 'Industry', type: 'text', required: true, placeholder: 'B2B SaaS, E-commerce, etc.' },
      { name: 'monthlyRevenue', label: 'Current Monthly Revenue ($)', type: 'number', required: true, placeholder: '50000' },
      { name: 'targetRevenue', label: 'Target Monthly Revenue ($)', type: 'number', required: true, placeholder: '100000' },
      { name: 'timeline', label: 'Desired Timeline', type: 'select', required: true, options: ['30 days', '60 days', '90 days', '6 months'] },
      { name: 'challenges', label: 'Key Revenue Challenges', type: 'textarea', required: true, placeholder: 'Describe your main revenue bottlenecks...' },
      { name: 'assets', label: 'Existing Assets/Data', type: 'textarea', required: false, placeholder: 'List any existing data, tools, or resources...' },
      { name: 'budget', label: 'Budget Range', type: 'select', required: true, options: ['$10k-$25k', '$25k-$50k', '$50k+', 'Not sure yet'] },
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
