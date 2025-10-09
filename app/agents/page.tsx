import { actionListAgents } from '@/core/agents/actions'

import AgentsDirectory from './AgentsDirectory'

export default async function AgentsHubPage() {
  const agents = await actionListAgents()

  return (
    <div className="w-full px-6 py-6">
      <AgentsDirectory agents={agents} />
    </div>
  )
}
