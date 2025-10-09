'use client'

import { Card, CardContent } from '@/ui/card'
import { useEffect, useState } from 'react'

type NewsItem = {
  id: string
  text: string
  timestamp: string
}

// Dummy data - can be swapped with API call via getNewsItems()
const dummyNews: NewsItem[] = [
  { id: '1', text: 'Pipeline coverage at 98% for Q4 targets', timestamp: '2 hours ago' },
  { id: '2', text: 'New partnership with Strategic Consulting Group closed', timestamp: '4 hours ago' },
  { id: '3', text: 'Client NPS increased 8 points this quarter', timestamp: '6 hours ago' },
  { id: '4', text: 'Finance reconciliation completed - all systems green', timestamp: '1 day ago' },
]

// Export function to allow API swap later
export function getNewsItems(): NewsItem[] {
  // TODO: Replace with API call
  return dummyNews
}

export function NewsTicker() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setNews(getNewsItems())
  }, [])

  useEffect(() => {
    if (news.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [news.length])

  if (news.length === 0) return null

  const currentNews = news[currentIndex]

  return (
    <Card className="bg-gradient-to-r from-slate-900 to-slate-700 text-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded bg-red-500 px-2 py-1 text-xs font-bold uppercase">Live</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{currentNews.text}</p>
          </div>
          <p className="text-xs opacity-75">{currentNews.timestamp}</p>
        </div>
      </CardContent>
    </Card>
  )
}
