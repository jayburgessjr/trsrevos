import { allEvents } from "@/core/events/store"

export function generateRecap(userId: string) {
  const ev = allEvents()
  const dollars = ev
    .filter(
      (e) =>
        (e.entity === "proposal" && e.action === "sent") ||
        (e.entity === "invoice" && (e.action === "sent" || e.action === "paid"))
    )
    .map((e) => Number((e.meta as any)?.amount || 0))
    .reduce((a, b) => a + b, 0)
  const shipped = ev.filter((e) =>
    ["proposal", "invoice", "pricing_rule", "content", "partner_step"].includes(e.entity)
  )
  const risks: string[] = []
  const tomorrow = "Block 1: follow-up on hottest deal at 8:45am"
  const md = `# TRS Recap

**Dollars advanced:** ${dollars.toLocaleString()}

**Shipped (${shipped.length}):**
${shipped.map((e) => `- ${e.entity}:${e.action}`).join("\n")}

**Risks:**
${risks.length ? risks.map((r) => `- ${r}`).join("\n") : "- None captured"}

**First action tomorrow:** ${tomorrow}
`
  return { dollars, shippedCount: shipped.length, markdown: md, tomorrow }
}
