'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { PageBody, PageHeader } from '@/components/layout/Page'

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

// Component to render formatted markdown-like text
function FormattedText({ content }: { content: string }) {
  const renderContent = () => {
    const lines = content.split('\n')
    const elements: JSX.Element[] = []

    lines.forEach((line, index) => {
      // Headers (##, ###)
      if (line.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-base font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>)
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={index} className="text-lg font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>)
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>)
      }
      // Bold text (**text**)
      else if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/)
        elements.push(
          <p key={index} className="mb-2">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>
              }
              return <span key={i}>{part}</span>
            })}
          </p>
        )
      }
      // Bullet points (-, *)
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(<li key={index} className="ml-4 mb-1">{line.trim().substring(2)}</li>)
      }
      // Numbered lists (1., 2., etc)
      else if (/^\d+\.\s/.test(line.trim())) {
        elements.push(<li key={index} className="ml-4 mb-1">{line.trim().replace(/^\d+\.\s/, '')}</li>)
      }
      // Empty lines
      else if (line.trim() === '') {
        elements.push(<br key={index} />)
      }
      // Regular text
      else {
        elements.push(<p key={index} className="mb-2">{line}</p>)
      }
    })

    return elements
  }

  return <div className="text-sm">{renderContent()}</div>
}

export default function BrainPageClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [threadId, setThreadId] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

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
    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/brain/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput, threadId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      // Update thread ID for future messages
      setThreadId(data.threadId)

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.response,
        sources: mockSources.slice(0, 2), // TODO: Get sources from API when available
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <PageBody>
      <PageHeader
        title="TRS Brain"
        description="Your knowledge layer. Ask about frameworks, past audits, offers, calculators, and SOPs."
      />

      <div className="grid flex-1 gap-6 lg:grid-cols-3">
        {/* Main Chat Area */}
        <Card className="flex min-h-[520px] flex-col border-slate-200 dark:border-slate-800 lg:col-span-2">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">Chat</CardTitle>
            <CardDescription>Ask questions, get answers with citations.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 pt-4">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-neutral-200/80 bg-white/70 p-4 dark:border-slate-800/60 dark:bg-slate-900/40">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-sm text-neutral-500 dark:text-slate-400">
                  <p className="font-medium">No messages yet</p>
                  <p className="mt-2 text-xs text-neutral-400 dark:text-slate-500">
                    Try asking about TRS frameworks, offers, or past audits.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        message.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <FormattedText content={message.content} />
                      )}

                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold text-neutral-500 dark:text-slate-300">Sources</p>
                          {message.sources.map((source) => (
                            <div
                              key={source.id}
                              className="rounded-lg border border-neutral-200/70 bg-white/90 p-3 text-xs dark:border-slate-800/70 dark:bg-slate-900/60"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <span className="font-medium text-slate-900 dark:text-slate-100">{source.title}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {source.type}
                                </Badge>
                              </div>
                              <p className="mt-1 text-neutral-600 dark:text-slate-400">{source.excerpt}</p>
                              <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-500 dark:text-slate-400">
                                <span>Relevance: {Math.round(source.relevance * 100)}%</span>
                                {source.url && (
                                  <a href={source.url} className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
                                    View →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {message.role === 'assistant' && (
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyMessage(message.content, message.id)}
                            className="text-xs"
                          >
                            {copiedMessageId === message.id ? (
                              <>
                                <Check className="mr-1 h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="mr-1 h-3 w-3" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      <p className="mt-2 text-[10px] text-neutral-400 dark:text-slate-500">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 dark:bg-slate-500"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 dark:bg-slate-500 delay-100"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 dark:bg-slate-500 delay-200"></div>
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
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
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
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
              <CardTitle className="text-lg font-semibold">Indexed Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Frameworks</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">12</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Past Audits</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">47</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">SOPs</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">23</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-3 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Templates</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">18</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
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
    </PageBody>
  )
}
