import type { Metadata } from 'next'

import RevenueClearOnboarding from '@/modules/revenue-clear/components/RevenueClearOnboarding'
import { listRevenuePipelineOptions } from '@/modules/revenue-clear/lib/queries'

export const metadata: Metadata = {
  title: 'Create Revenue Clear Client | TRS RevOS',
  description: 'Promote a pipeline opportunity or add a new client to launch the Revenue Clear workflow.',
}

export default async function RevenueClearNewClientPage() {
  const pipelineOptions = await listRevenuePipelineOptions()

  return <RevenueClearOnboarding pipelineOptions={pipelineOptions} />
}
