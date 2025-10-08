import { z } from 'zod'

export const deliverableTypeSchema = z.enum([
  'CLARITY_AUDIT',
  'GAP_MAP',
  'INTERVENTION_BLUEPRINT',
  'REVBOARD',
  'MONTHLY_ROI',
  'QUARTERLY_ROI',
  'CASE_STUDY_PACKET'
])

export const deliverableStatusSchema = z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETE', 'BLOCKED'])

export const deliverableCreateSchema = z.object({
  accountSlug: z.string().default('demo'),
  type: deliverableTypeSchema,
  title: z.string().min(2),
  owner: z.string().min(2),
  status: deliverableStatusSchema.default('PLANNED'),
  dueDate: z.coerce.date().nullable().optional()
})

export const deliverableUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  owner: z.string().min(2).optional(),
  status: deliverableStatusSchema.optional(),
  dueDate: z.coerce.date().nullable().optional(),
  lastReviewAt: z.coerce.date().nullable().optional(),
  exportLink: z.string().url().nullable().optional()
})

export const deliverableResponseSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  type: deliverableTypeSchema,
  title: z.string(),
  status: deliverableStatusSchema,
  owner: z.string(),
  dueDate: z.string().nullable(),
  lastReviewAt: z.string().nullable(),
  exportLink: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type DeliverableResponse = z.infer<typeof deliverableResponseSchema>

export type DeliverableType = z.infer<typeof deliverableTypeSchema>
export type DeliverableStatus = z.infer<typeof deliverableStatusSchema>
export type DeliverableCreateInput = z.infer<typeof deliverableCreateSchema>
export type DeliverableUpdateInput = z.infer<typeof deliverableUpdateSchema>
