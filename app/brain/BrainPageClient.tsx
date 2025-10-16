'use client'

import { useState } from 'react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'

type SourceCard = {
  id: string
  title: string
  type: 'Framework' | 'Playbook' | 'SOP' | 'Audit' | 'Deck' | 'Policy' | 'Template'
  excerpt: string
  url?: string
  relevance: number
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SourceCard[]
  timestamp: Date
}

export default function BrainPageClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock sources for demonstration
  const mockSources: SourceCard[] = [
    {
      id: 'src-1',
      title: 'Revenue Clarity Audit Framework',
      type: 'Framework',
      excerpt: 'Four-dimension assessment: Pricing Architecture, Activation Systems, Retention Mechanics, Data Infrastructure...',
      url: '#',
      relevance: 0.95
    },
    {
      id: 'src-2',
      title: 'Offer Structure Playbook',
      type: 'Playbook',
      excerpt: 'Standard tiers: Implementation + Advisory ($45k), Advisory-only ($18k), RevenueOS lead-in...',
      url: '#',
      relevance: 0.88
    },
    {
      id: 'src-3',
      title: 'Section 8 Finance Rules',
      type: 'Policy',
      excerpt: 'Pricing floors, discount limits, payment terms (Net15/Net30), revenue recognition...',
      url: '#',
      relevance: 0.82
    }
  ]

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response with sources
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: `Based on TRS frameworks, here's what I found: ${input.toLowerCase().includes('offer') ? 'Our standard offer structure includes three tiers. Implementation + Advisory ($45k, 12 weeks) is recommended for clients with readiness scores below 70 and $200k+ opportunity. Advisory-only ($18k, 90 days) suits clients with strong internal capacity. RevenueOS lead-in is for enterprise prospects.' : input.toLowerCase().includes('audit') ? 'The Revenue Clarity Audit assesses four dimensions: Pricing Architecture, Activation Systems, Retention Mechanics, and Data Infrastructure. Each dimension receives a 0-100 score, with overall readiness calculated as a weighted average. Gaps are prioritized by ease (1-5) and confidence (0-1).' : 'I can help you with TRS frameworks, past audits, offers, calculators, SOPs, and templates. What would you like to know?'}`,
        sources: mockSources.slice(0, 2),
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleSendToOfferDesk = (messageId: string) => {
    alert(`Sending message ${messageId} to OfferDesk agent...`)
    // TODO: Implement actual integration with OfferDesk agent
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">TRS Brain</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your knowledge layer. Ask about frameworks, past audits, offers, calculators, and SOPs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chat Area */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">Chat</CardTitle>
            <CardDescription>Ask questions, get answers with citations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Messages */}
            <div className="space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-[400px] text-sm text-slate-500">
                  <div className="text-center space-y-2">
                    <p className="font-medium">No messages yet</p>
                    <p className="text-xs">Try asking about TRS frameworks, offers, or past audits</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold text-slate-600">Sources:</p>
                          {message.sources.map((source) => (
                            <div
                              key={source.id}
                              className="rounded-md border border-slate-200 bg-white p-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-900">{source.title}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {source.type}
                                </Badge>
                              </div>
                              <p className="mt-1 text-slate-600">{source.excerpt}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-slate-500">
                                  Relevance: {Math.round(source.relevance * 100)}%
                                </span>
                                {source.url && (
                                  <a href={source.url} className="text-blue-600 hover:underline">
                                    View →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Send to OfferDesk */}
                      {message.role === 'assistant' && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendToOfferDesk(message.id)}
                            className="text-xs"
                          >
                            Send to OfferDesk
                          </Button>
                        </div>
                      )}

                      <p className="mt-2 text-[10px] opacity-70 suppress-hydration-warning">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-slate-100 p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 delay-100"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about TRS frameworks, past audits, offers, or SOPs..."
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
                  {isLoading ? 'Thinking...' : 'Send'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base Search & Stats */}
        <div className="space-y-4">
          {/* Search */}
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-200/60 pb-4">
              <CardTitle className="text-lg font-semibold">Knowledge Base</CardTitle>
              <CardDescription>Search indexed sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <Input
                type="search"
                placeholder="Search frameworks, SOPs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Source type filters */}
              <div className="flex flex-wrap gap-2">
                {['Framework', 'Playbook', 'SOP', 'Audit', 'Policy', 'Template'].map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="cursor-pointer hover:bg-slate-100"
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-200/60 pb-4">
              <CardTitle className="text-lg font-semibold">Indexed Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500">Frameworks</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">12</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500">Past Audits</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">47</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500">SOPs</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">23</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500">Templates</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">18</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-200/60 pb-4">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <Button variant="outline" className="w-full justify-start text-sm">
                View Recent Audits
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                Offer Templates
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                Pricing Calculator
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                Export Knowledge Base
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
