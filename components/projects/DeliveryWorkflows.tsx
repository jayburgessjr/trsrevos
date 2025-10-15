'use client'

import { useMemo, useState, useTransition } from 'react'

import type {
  ProjectDeliveryUpdate,
  ProjectChangeOrder,
} from '@/core/projects/types'
import type { ProjectRecord, OpportunityRecord } from '@/core/projects/queries'
import { showToast } from '@/ui/toast'

const CARD_CLASS = 'rounded-xl border border-gray-200 bg-white p-4'

const DELIVERY_STATUSES = ['On Track', 'At Risk', 'Blocked', 'Complete']
const REMINDER_OPTIONS = ['Daily', 'Weekly', 'Biweekly', 'Monthly'] as const
const CHANGE_ORDER_STATUSES = ['Draft', 'Submitted', 'Approved', 'Rejected'] as const

type InvoiceOption = { id: string; label: string }

type DeliveryWorkflowsProps = {
  projects: ProjectRecord[]
  deliveryUpdates: ProjectDeliveryUpdate[]
  changeOrders: ProjectChangeOrder[]
  opportunities: OpportunityRecord[]
  invoices: InvoiceOption[]
  onCreateDeliveryUpdate: (update: ProjectDeliveryUpdate) => void
  onUpdateDeliveryApproval: (update: ProjectDeliveryUpdate) => void
  onCreateChangeOrder: (changeOrder: ProjectChangeOrder) => void
  onUpdateChangeOrder: (changeOrder: ProjectChangeOrder) => void
}

type DeliveryFormState = {
  projectId: string
  status: string
  blockers: string
  decisions: string
  reminderCadence: (typeof REMINDER_OPTIONS)[number]
  nextReviewAt: string
  requiresApproval: boolean
  approverIds: string
}

type ChangeOrderFormState = {
  projectId: string
  title: string
  description: string
  value: string
  invoiceId: string
  opportunityId: string
  status: (typeof CHANGE_ORDER_STATUSES)[number]
}

const INITIAL_DELIVERY_FORM: DeliveryFormState = {
  projectId: '',
  status: 'On Track',
  blockers: '',
  decisions: '',
  reminderCadence: 'Weekly',
  nextReviewAt: '',
  requiresApproval: false,
  approverIds: '',
}

const INITIAL_CHANGE_ORDER_FORM: ChangeOrderFormState = {
  projectId: '',
  title: '',
  description: '',
  value: '',
  invoiceId: '',
  opportunityId: '',
  status: 'Submitted',
}

export function DeliveryWorkflows({
  projects,
  deliveryUpdates,
  changeOrders,
  opportunities,
  invoices,
  onCreateDeliveryUpdate,
  onUpdateDeliveryApproval,
  onCreateChangeOrder,
  onUpdateChangeOrder,
}: DeliveryWorkflowsProps) {
  const [deliveryForm, setDeliveryForm] = useState<DeliveryFormState>(INITIAL_DELIVERY_FORM)
  const [changeOrderForm, setChangeOrderForm] = useState<ChangeOrderFormState>(INITIAL_CHANGE_ORDER_FORM)
  const [deliveryPending, startDelivery] = useTransition()
  const [approvalPending, startApproval] = useTransition()
  const [changeOrderPending, startChangeOrder] = useTransition()

  const projectOptions = useMemo(
    () =>
      projects
        .map((project) => ({ id: project.id, label: project.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [projects],
  )

  const opportunityOptions = useMemo(
    () =>
      opportunities
        .map((opportunity) => ({
          id: opportunity.id,
          label: opportunity.name ? `${opportunity.name}` : opportunity.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [opportunities],
  )

  const sortedUpdates = useMemo(() => {
    return [...deliveryUpdates].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
  }, [deliveryUpdates])

  const sortedChangeOrders = useMemo(() => {
    return [...changeOrders].sort((a, b) => (a.submittedAt > b.submittedAt ? -1 : 1))
  }, [changeOrders])

  const handleDeliverySubmit = () => {
    if (!deliveryForm.projectId) {
      showToast({ title: 'Delivery update', description: 'Select a project before submitting.', variant: 'destructive' })
      return
    }
    startDelivery(async () => {
      const response = await fetch('/api/projects/delivery-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: deliveryForm.projectId,
          status: deliveryForm.status,
          blockers: deliveryForm.blockers || undefined,
          decisions: deliveryForm.decisions || undefined,
          reminderCadence: deliveryForm.reminderCadence,
          nextReviewAt: deliveryForm.nextReviewAt || undefined,
          requiresApproval: deliveryForm.requiresApproval,
          approverIds: deliveryForm.approverIds
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      })

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean
        error?: string
        update?: ProjectDeliveryUpdate
      }

      if (!response.ok || !payload?.ok || !payload.update) {
        showToast({
          title: 'Delivery update failed',
          description: payload?.error ?? 'Unable to save update',
          variant: 'destructive',
        })
        return
      }

      onCreateDeliveryUpdate(payload.update)
      showToast({ title: 'Delivery update logged', description: 'Status and blockers captured.' })
      setDeliveryForm(INITIAL_DELIVERY_FORM)
    })
  }

  const handleApproval = (updateId: string, approverId: string, nextStatus: 'Approved' | 'Rejected') => {
    startApproval(async () => {
      const response = await fetch('/api/projects/delivery-updates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: updateId, approverId, approvalStatus: nextStatus }),
      })

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean
        error?: string
        update?: ProjectDeliveryUpdate
      }

      if (!response.ok || !payload?.ok || !payload.update) {
        showToast({
          title: 'Approval update failed',
          description: payload?.error ?? 'Unable to update approval state',
          variant: 'destructive',
        })
        return
      }

      onUpdateDeliveryApproval(payload.update)
      showToast({ title: 'Approval recorded', description: `Marked as ${nextStatus}.` })
    })
  }

  const handleChangeOrderSubmit = () => {
    if (!changeOrderForm.projectId || !changeOrderForm.title || !changeOrderForm.value) {
      showToast({
        title: 'Change order',
        description: 'Project, title, and value are required.',
        variant: 'destructive',
      })
      return
    }

    const numericValue = Number.parseFloat(changeOrderForm.value)
    if (Number.isNaN(numericValue)) {
      showToast({ title: 'Change order', description: 'Provide a numeric value.', variant: 'destructive' })
      return
    }

    startChangeOrder(async () => {
      const response = await fetch('/api/projects/change-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: changeOrderForm.projectId,
          title: changeOrderForm.title,
          description: changeOrderForm.description || undefined,
          value: numericValue,
          invoiceId: changeOrderForm.invoiceId || undefined,
          opportunityId: changeOrderForm.opportunityId || undefined,
          status: changeOrderForm.status,
        }),
      })

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean
        error?: string
        changeOrder?: ProjectChangeOrder
      }

      if (!response.ok || !payload?.ok || !payload.changeOrder) {
        showToast({
          title: 'Change order failed',
          description: payload?.error ?? 'Unable to save change order',
          variant: 'destructive',
        })
        return
      }

      onCreateChangeOrder(payload.changeOrder)
      showToast({ title: 'Change order submitted', description: 'Request logged with delivery and finance.' })
      setChangeOrderForm(INITIAL_CHANGE_ORDER_FORM)
    })
  }

  const handleChangeOrderStatus = (id: string, status: ProjectChangeOrder['status']) => {
    startChangeOrder(async () => {
      const response = await fetch('/api/projects/change-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean
        error?: string
        changeOrder?: ProjectChangeOrder
      }

      if (!response.ok || !payload?.ok || !payload.changeOrder) {
        showToast({
          title: 'Update failed',
          description: payload?.error ?? 'Unable to update change order status',
          variant: 'destructive',
        })
        return
      }

      onUpdateChangeOrder(payload.changeOrder)
      showToast({ title: 'Change order updated', description: `Status set to ${status}.` })
    })
  }

  return (
    <div className="grid gap-4">
      <section className={CARD_CLASS}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-black">Structured delivery updates</h3>
            <p className="text-xs text-gray-500">
              Log status, blockers, and decisions. Approvers close the loop directly from the queue.
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-[1fr,1fr]">
          <form
            className="rounded-lg border border-gray-100 p-3 text-xs text-gray-700"
            onSubmit={(event) => {
              event.preventDefault()
              handleDeliverySubmit()
            }}
          >
            <div className="text-sm font-medium text-black">New update</div>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Project</span>
              <select
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={deliveryForm.projectId}
                onChange={(event) => setDeliveryForm((prev) => ({ ...prev, projectId: event.target.value }))}
              >
                <option value="">Select project</option>
                {projectOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Status</span>
              <select
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={deliveryForm.status}
                onChange={(event) => setDeliveryForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                {DELIVERY_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Blockers</span>
              <textarea
                className="mt-1 h-16 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={deliveryForm.blockers}
                onChange={(event) => setDeliveryForm((prev) => ({ ...prev, blockers: event.target.value }))}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Decisions</span>
              <textarea
                className="mt-1 h-16 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={deliveryForm.decisions}
                onChange={(event) => setDeliveryForm((prev) => ({ ...prev, decisions: event.target.value }))}
              />
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Reminder cadence
                </span>
                <select
                  className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                  value={deliveryForm.reminderCadence}
                  onChange={(event) =>
                    setDeliveryForm((prev) => ({
                      ...prev,
                      reminderCadence: event.target.value as DeliveryFormState['reminderCadence'],
                    }))
                  }
                >
                  {REMINDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Next review</span>
                <input
                  type="date"
                  className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                  value={deliveryForm.nextReviewAt}
                  onChange={(event) => setDeliveryForm((prev) => ({ ...prev, nextReviewAt: event.target.value }))}
                />
              </label>
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={deliveryForm.requiresApproval}
                onChange={(event) =>
                  setDeliveryForm((prev) => ({ ...prev, requiresApproval: event.target.checked }))
                }
              />
              Requires approval
            </label>
            {deliveryForm.requiresApproval ? (
              <label className="mt-2 block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Approver IDs (comma separated)
                </span>
                <input
                  className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                  value={deliveryForm.approverIds}
                  onChange={(event) => setDeliveryForm((prev) => ({ ...prev, approverIds: event.target.value }))}
                  placeholder="approver-1, approver-2"
                />
              </label>
            ) : null}
            <button
              type="submit"
              className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-3 text-sm font-medium text-white transition hover:bg-black"
              disabled={deliveryPending}
            >
              {deliveryPending ? 'Logging update…' : 'Submit update'}
            </button>
          </form>

          <div className="space-y-3 text-xs text-gray-700">
            {sortedUpdates.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-4 text-gray-500">
                No delivery updates captured yet. Capture structured updates to inform client stakeholders.
              </div>
            ) : (
              sortedUpdates.map((update) => (
                <div key={update.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between text-sm font-medium text-black">
                    <span>{update.projectName}</span>
                    <span>{update.status}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">Logged {new Date(update.createdAt).toLocaleString()}</p>
                  {update.blockers ? (
                    <p className="mt-2 text-[11px] text-gray-600">Blockers: {update.blockers}</p>
                  ) : null}
                  {update.decisions ? (
                    <p className="mt-1 text-[11px] text-gray-600">Decisions: {update.decisions}</p>
                  ) : null}
                  {update.approvals.length ? (
                    <div className="mt-2 space-y-1">
                      {update.approvals.map((approval) => {
                        const isPending = approval.status === 'Pending'
                        return (
                          <div key={approval.approverId} className="flex items-center justify-between">
                            <span>
                              {approval.approverName}{' '}
                              <span className="text-[10px] text-gray-500">({approval.status})</span>
                            </span>
                            {isPending ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="rounded border border-gray-200 px-2 py-1 text-[11px]"
                                  onClick={() => handleApproval(update.id, approval.approverId, 'Approved')}
                                  disabled={approvalPending}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="rounded border border-gray-200 px-2 py-1 text-[11px]"
                                  onClick={() => handleApproval(update.id, approval.approverId, 'Rejected')}
                                  disabled={approvalPending}
                                >
                                  Escalate
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-500">
                                {approval.respondedAt ? new Date(approval.respondedAt).toLocaleString() : ''}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className={CARD_CLASS}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-black">Change orders & commercial governance</h3>
            <p className="text-xs text-gray-500">
              Tie scope changes to invoices and opportunities to keep revenue teams aligned.
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-[1fr,1fr]">
          <form
            className="rounded-lg border border-gray-100 p-3 text-xs text-gray-700"
            onSubmit={(event) => {
              event.preventDefault()
              handleChangeOrderSubmit()
            }}
          >
            <div className="text-sm font-medium text-black">New change order</div>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Project</span>
              <select
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={changeOrderForm.projectId}
                onChange={(event) => setChangeOrderForm((prev) => ({ ...prev, projectId: event.target.value }))}
              >
                <option value="">Select project</option>
                {projectOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Title</span>
              <input
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={changeOrderForm.title}
                onChange={(event) => setChangeOrderForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Description</span>
              <textarea
                className="mt-1 h-16 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={changeOrderForm.description}
                onChange={(event) => setChangeOrderForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Value (USD)</span>
              <input
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={changeOrderForm.value}
                onChange={(event) => setChangeOrderForm((prev) => ({ ...prev, value: event.target.value }))}
              />
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Invoice</span>
                <select
                  className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                  value={changeOrderForm.invoiceId}
                  onChange={(event) => setChangeOrderForm((prev) => ({ ...prev, invoiceId: event.target.value }))}
                >
                  <option value="">Select invoice</option>
                  {invoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Opportunity</span>
                <select
                  className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                  value={changeOrderForm.opportunityId}
                  onChange={(event) => setChangeOrderForm((prev) => ({ ...prev, opportunityId: event.target.value }))}
                >
                  <option value="">Select opportunity</option>
                  {opportunityOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Status</span>
              <select
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={changeOrderForm.status}
                onChange={(event) =>
                  setChangeOrderForm((prev) => ({
                    ...prev,
                    status: event.target.value as ChangeOrderFormState['status'],
                  }))
                }
              >
                {CHANGE_ORDER_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-3 text-sm font-medium text-white transition hover:bg-black"
              disabled={changeOrderPending}
            >
              {changeOrderPending ? 'Submitting…' : 'Log change order'}
            </button>
          </form>

          <div className="space-y-3 text-xs text-gray-700">
            {sortedChangeOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-4 text-gray-500">
                No change orders on record. Link orders to invoices to keep finance and delivery aligned.
              </div>
            ) : (
              sortedChangeOrders.map((order) => (
                <div key={order.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between text-sm font-medium text-black">
                    <span>{order.projectName}</span>
                    <span>{order.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Submitted {new Date(order.submittedAt).toLocaleString()} • ${order.value.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-600">{order.title}</p>
                  {order.description ? (
                    <p className="mt-1 text-[11px] text-gray-500">{order.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-gray-500">
                    {order.invoiceNumber ? <span>Invoice {order.invoiceNumber}</span> : null}
                    {order.opportunityName ? <span>Opportunity {order.opportunityName}</span> : null}
                  </div>
                  {order.status !== 'Approved' && order.status !== 'Rejected' ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="rounded border border-gray-200 px-2 py-1 text-[11px]"
                        onClick={() => handleChangeOrderStatus(order.id, 'Approved')}
                        disabled={changeOrderPending}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="rounded border border-gray-200 px-2 py-1 text-[11px]"
                        onClick={() => handleChangeOrderStatus(order.id, 'Rejected')}
                        disabled={changeOrderPending}
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
