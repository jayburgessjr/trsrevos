'use client'

import { Card, CardContent } from '@/ui/card'
import { useState, useEffect } from 'react'

const quotes = [
  { text: 'Revenue is a lagging indicator. Culture is a leading one.', author: 'Anonymous' },
  { text: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'Efficiency is doing things right; effectiveness is doing the right things.', author: 'Peter Drucker' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
]

type MotivationalQuoteProps = {
  overrideQuote?: { text: string; author: string }
}

export function MotivationalQuote({ overrideQuote }: MotivationalQuoteProps) {
  const [quote, setQuote] = useState(overrideQuote || quotes[0])

  useEffect(() => {
    if (!overrideQuote) {
      const randomIndex = Math.floor(Math.random() * quotes.length)
      setQuote(quotes[randomIndex])
    }
  }, [overrideQuote])

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="space-y-3">
          <p className="text-lg font-medium italic text-[color:var(--color-text)]">&ldquo;{quote.text}&rdquo;</p>
          <p className="text-sm text-[color:var(--color-text-muted)]">— {quote.author}</p>
        </div>
      </CardContent>
    </Card>
  )
}
