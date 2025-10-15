import RevenueClearShell from '@/modules/revenue-clear/components/RevenueClearShell'
import { getRevenueClearSnapshot } from '@/modules/revenue-clear/lib/queries'

export default async function RevenueClearPage({ params }: { params: { id: string } }) {
  const snapshot = await getRevenueClearSnapshot(params.id)

  return <RevenueClearShell snapshot={snapshot} />
}
