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
    <div className="space-y-6">
      {/* Header with Edit Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Financials</h2>
          <p className="text-sm text-gray-500 mt-1">Revenue tracking and invoicing</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#fd8216] hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit Financials
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#fd8216] hover:bg-[#e67412] rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Revenue Target */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#fd8216]" />
          Revenue Target
        </h3>
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={revenueTarget}
                onChange={(e) => setRevenueTarget(parseFloat(e.target.value))}
                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
              />
            </div>
          </div>
        ) : (
          <div className="text-4xl font-bold text-gray-900">
            ${revenueTarget.toLocaleString()}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Progress</h3>
          <span className="text-sm font-medium text-gray-500">{percentageComplete}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-[#fd8216] h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(percentageComplete, 100)}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Paid</span>
            <div className="font-semibold text-green-600">${mockFinancials.paid.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-gray-500">Outstanding</span>
            <div className="font-semibold text-yellow-600">${mockFinancials.outstanding.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-gray-500">Remaining</span>
            <div className="font-semibold text-gray-600">
              ${(revenueTarget - mockFinancials.invoiced).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* QuickBooks Integration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#fd8216]" />
          QuickBooks Integration
        </h3>
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice URL</label>
            <input
              type="url"
              value={quickbooksUrl}
              onChange={(e) => setQuickbooksUrl(e.target.value)}
              placeholder="https://qbo.intuit.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
            />
          </div>
        ) : quickbooksUrl ? (
          <a
            href={quickbooksUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-[#fd8216] hover:bg-[#e67412] text-white rounded-lg font-medium transition-colors w-fit"
          >
            <ExternalLink className="h-5 w-5" />
            View Invoice in QuickBooks
          </a>
        ) : (
          <p className="text-gray-500 text-sm">No QuickBooks invoice URL set</p>
        )}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <DollarSign className="h-4 w-4" />
            Revenue Target
          </div>
          <div className="text-2xl font-bold text-gray-900">${revenueTarget.toLocaleString()}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <TrendingUp className="h-4 w-4" />
            Total Invoiced
          </div>
          <div className="text-2xl font-bold text-blue-600">${mockFinancials.invoiced.toLocaleString()}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <DollarSign className="h-4 w-4" />
            Total Paid
          </div>
          <div className="text-2xl font-bold text-green-600">${mockFinancials.paid.toLocaleString()}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Calendar className="h-4 w-4" />
            Outstanding
          </div>
          <div className="text-2xl font-bold text-yellow-600">${mockFinancials.outstanding.toLocaleString()}</div>
        </div>
      </div>

      {/* Payment Schedule (Mock) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Initial Payment</div>
              <div className="text-sm text-gray-500">Received on {new Date(project.created_at).toLocaleDateString()}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-600">${mockFinancials.paid.toLocaleString()}</div>
              <div className="text-xs text-green-600">Paid</div>
            </div>
          </div>

          {mockFinancials.outstanding > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Outstanding Balance</div>
                <div className="text-sm text-gray-500">Due upon completion</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-yellow-600">${mockFinancials.outstanding.toLocaleString()}</div>
                <div className="text-xs text-yellow-600">Pending</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
