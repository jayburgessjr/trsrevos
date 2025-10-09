export function toICal(blocks: { start: string; end: string }[], firstAction: string) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0"]
  blocks.forEach((b, i) => {
    lines.push(
      "BEGIN:VEVENT",
      `SUMMARY:TRS Focus Block ${i + 1}`,
      `DTSTART:${b.start.replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z")}`,
      `DTEND:${b.end.replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z")}`,
      "END:VEVENT"
    )
  })
  lines.push(
    "BEGIN:VEVENT",
    `SUMMARY:TRS First Action Tomorrow: ${firstAction}`,
    "DTSTART:20300101T090000Z",
    "DTEND:20300101T093000Z",
    "END:VEVENT",
    "END:VCALENDAR"
  )
  return lines.join("\n")
}
