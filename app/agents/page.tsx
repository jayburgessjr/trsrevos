import { actionListAgents } from '@/core/agents/actions'

import AgentsDirectory from './AgentsDirectory'

export default async function AgentsHubPage() {
  const agents = await actionListAgents()

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <AgentsDirectory agents={agents} />
    </div>
  )
}
