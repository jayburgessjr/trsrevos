import { actionListAgents } from '@/core/agents/actions'

import AgentsDirectory from './AgentsDirectory'

export default async function AgentsHubPage() {
  const agents = await actionListAgents()

  return (
    <div
      className="grid min-h-full gap-3 p-3"
      style={{ gridTemplateColumns: "repeat(12,minmax(0,1fr))" }}
    >
      <section className="col-span-12">
        <AgentsDirectory agents={agents} />
      </section>
    </div>
  )
}
