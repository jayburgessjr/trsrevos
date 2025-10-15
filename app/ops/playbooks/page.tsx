import { listAutomationPlaybooks } from '@/core/automations/actions'

import PlaybookBuilderClient from './PlaybookBuilderClient'

export default async function PlaybooksPage() {
  const playbooks = await listAutomationPlaybooks()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <PlaybookBuilderClient playbooks={playbooks} />
    </div>
  )
}
