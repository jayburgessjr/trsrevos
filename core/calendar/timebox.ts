export function generateICalForFocusBlocks(userId: string, focusBlocks: Array<{ startTime: string; endTime: string; durationMinutes: number }>, firstActionTomorrow: string): string {
  const formatICalDate = (isoString: string) => {
    return isoString.replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)

  const events = [
    ...focusBlocks.map((block, idx) => ({
      uid: `focus-${userId}-${idx}-${Date.now()}`,
      summary: `Focus Block ${idx + 1}`,
      description: '50-minute deep work session',
      start: formatICalDate(block.startTime),
      end: formatICalDate(block.endTime),
    })),
    {
      uid: `first-action-${userId}-${Date.now()}`,
      summary: 'First Action Tomorrow',
      description: firstActionTomorrow,
      start: formatICalDate(tomorrow.toISOString()),
      end: formatICalDate(new Date(tomorrow.getTime() + 30 * 60 * 1000).toISOString()),
    },
  ]

  const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TRS RevenueOS//Daily Plan//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events
  .map(
    (e) => `BEGIN:VEVENT
UID:${e.uid}
DTSTAMP:${formatICalDate(now.toISOString())}
DTSTART:${e.start}
DTEND:${e.end}
SUMMARY:${e.summary}
DESCRIPTION:${e.description}
END:VEVENT`,
  )
  .join('\n')}
END:VCALENDAR`

  return ical
}
