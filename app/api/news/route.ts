import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY || process.env.NEWS_API_KEY

    if (!apiKey || apiKey === 'demo') {
      // Return fallback mock data if no API key
      return NextResponse.json({
        articles: [
          {
            title: 'Global Markets Rally on Strong Economic Data',
            description: 'Stock markets around the world show positive momentum',
            url: '#',
            publishedAt: new Date().toISOString(),
            source: { name: 'Financial Times' }
          },
          {
            title: 'Tech Sector Leads Innovation Wave',
            description: 'Technology companies continue to drive market growth',
            url: '#',
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
            source: { name: 'Bloomberg' }
          },
          {
            title: 'Sustainable Business Practices on the Rise',
            description: 'Companies increasingly focus on environmental impact',
            url: '#',
            publishedAt: new Date(Date.now() - 172800000).toISOString(),
            source: { name: 'Reuters' }
          },
          {
            title: 'AI Transformation Reshapes Industries',
            description: 'Artificial intelligence adoption accelerates across sectors',
            url: '#',
            publishedAt: new Date(Date.now() - 259200000).toISOString(),
            source: { name: 'Wall Street Journal' }
          }
        ]
      })
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=6&apiKey=${apiKey}`,
      {
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching news:', error)

    // Return fallback data on error
    return NextResponse.json({
      articles: [
        {
          title: 'Business News Available Soon',
          description: 'Latest business and market updates will appear here',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: { name: 'News Service' }
        }
      ]
    })
  }
}
