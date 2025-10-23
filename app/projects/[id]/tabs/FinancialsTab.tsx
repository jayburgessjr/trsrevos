'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Calendar, ExternalLink, Edit2, Save, X } from 'lucide-react'
import type { ProjectWorkspaceProject } from '../ProjectWorkspace'

interface FinancialsTabProps {
  project: ProjectWorkspaceProject
}

export default function FinancialsTab({ project }: FinancialsTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [revenueTarget, setRevenueTarget] = useState(project.revenue_target || 0)
  const [quickbooksUrl, setQuickbooksUrl] = useState(project.quickbooks_invoice_url || '')

  // Mock financial data - in production this would come from actual invoices/payments
  const mockFinancials = {
    invoiced: project.revenue_target ? project.revenue_target * 0.75 : 0,
    paid: project.revenue_target ? project.revenue_target * 0.5 : 0,
    outstanding: project.revenue_target ? project.revenue_target * 0.25 : 0,
  }

  const percentageComplete = project.revenue_target > 0
    ? Math.round((mockFinancials.paid / project.revenue_target) * 100)
    : 0

  const handleSave = async () => {
    // TODO: Implement save functionality with Supabase
    console.log('Saving financials:', { revenueTarget, quickbooksUrl })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setRevenueTarget(project.revenue_target || 0)
    setQuickbooksUrl(project.quickbooks_invoice_url || '')
    setIsEditing(false)
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header with Edit Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Financials</h2>
          <p className="mt-1 text-sm text-green-200">Revenue tracking and invoicing</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            <Edit2 className="h-4 w-4 text-white transition-colors group-hover:text-green-900" />
            Edit Financials
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
            >
              <Save className="h-4 w-4 text-white transition-colors group-hover:text-green-900" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
            >
              <X className="h-4 w-4 text-white transition-colors group-hover:text-green-900" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Revenue Target */}
      <div className="rounded-lg border border-orange-500 bg-green-800 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <DollarSign className="h-5 w-5 text-white" />
          Revenue Target
        </h3>
        {isEditing ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-green-200">Target Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-200">$</span>
              <input
                type="number"
                value={revenueTarget}
                onChange={(e) => setRevenueTarget(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-orange-500 bg-green-950 pl-7 pr-4 py-2 text-white focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
        ) : (
          <div className="text-4xl font-bold text-white">
            ${revenueTarget.toLocaleString()}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="rounded-lg border border-orange-500 bg-green-800 p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Revenue Progress</h3>
          <span className="text-sm font-medium text-green-200">{percentageComplete}% Complete</span>
        </div>
        <div className="mb-4 h-4 w-full rounded-full bg-green-950">
          <div
            className="h-4 rounded-full bg-orange-500 transition-all duration-300"
            style={{ width: `${Math.min(percentageComplete, 100)}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm text-green-100">
          <div>
            <span className="text-green-200">Paid</span>
            <div className="font-semibold text-white">${mockFinancials.paid.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-green-200">Outstanding</span>
            <div className="font-semibold text-white">${mockFinancials.outstanding.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-green-200">Remaining</span>
            <div className="font-semibold text-white">
              ${(revenueTarget - mockFinancials.invoiced).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* QuickBooks Integration */}
      <div className="rounded-lg border border-orange-500 bg-green-800 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <TrendingUp className="h-5 w-5 text-white" />
          QuickBooks Integration
        </h3>
        {isEditing ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-green-200">Invoice URL</label>
            <input
              type="url"
              value={quickbooksUrl}
              onChange={(e) => setQuickbooksUrl(e.target.value)}
              placeholder="https://qbo.intuit.com/..."
              className="w-full rounded-lg border border-orange-500 bg-green-950 px-4 py-2 text-white placeholder:text-green-200 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        ) : quickbooksUrl ? (
          <a
            href={quickbooksUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-fit items-center gap-2 rounded-lg border border-orange-500 bg-green-800 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-500"
          >
            <ExternalLink className="h-5 w-5 text-white transition-colors group-hover:text-green-900" />
            View Invoice in QuickBooks
          </a>
        ) : (
          <p className="text-sm text-green-200">No QuickBooks invoice URL set</p>
        )}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm text-green-200">
            <DollarSign className="h-4 w-4 text-white" />
            Revenue Target
          </div>
          <div className="text-2xl font-bold text-white">${revenueTarget.toLocaleString()}</div>
        </div>

        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm text-green-200">
            <TrendingUp className="h-4 w-4 text-white" />
            Total Invoiced
          </div>
          <div className="text-2xl font-bold text-white">${mockFinancials.invoiced.toLocaleString()}</div>
        </div>

        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm text-green-200">
            <DollarSign className="h-4 w-4 text-white" />
            Total Paid
          </div>
          <div className="text-2xl font-bold text-white">${mockFinancials.paid.toLocaleString()}</div>
        </div>

        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm text-green-200">
            <Calendar className="h-4 w-4 text-white" />
            Outstanding
          </div>
          <div className="text-2xl font-bold text-white">${mockFinancials.outstanding.toLocaleString()}</div>
        </div>
      </div>

      {/* Payment Schedule (Mock) */}
      <div className="rounded-lg border border-orange-500 bg-green-800 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Payment Schedule</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-orange-500 bg-green-900 p-3">
            <div>
              <div className="font-medium text-white">Initial Payment</div>
              <div className="text-sm text-green-200">Received on {new Date(project.created_at).toLocaleDateString()}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">${mockFinancials.paid.toLocaleString()}</div>
              <div className="text-xs text-green-200">Paid</div>
            </div>
          </div>

          {mockFinancials.outstanding > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-orange-500 bg-green-900 p-3">
              <div>
                <div className="font-medium text-white">Outstanding Balance</div>
                <div className="text-sm text-green-200">Due upon completion</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">${mockFinancials.outstanding.toLocaleString()}</div>
                <div className="text-xs text-green-200">Pending</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
