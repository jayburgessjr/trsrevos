'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">TRS Brain</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Your knowledge layer. Ask about frameworks, past audits, offers, calculators, and SOPs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chat Area */}
        <Card className="border-slate-200 dark:border-slate-800 lg:col-span-2">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">Chat</CardTitle>
            <CardDescription>Ask questions, get answers with citations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Messages */}
            <div className="space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-[400px] text-sm text-slate-500 dark:text-slate-400">
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
                          ? 'bg-blue-600 dark:bg-blue-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {/* Message content with formatting */}
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <FormattedText content={message.content} />
                      )}

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Sources:</p>
                          {message.sources.map((source) => (
                            <div
                              key={source.id}
                              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-900 dark:text-slate-100">{source.title}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {source.type}
                                </Badge>
                              </div>
                              <p className="mt-1 text-slate-600 dark:text-slate-400">{source.excerpt}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-slate-500 dark:text-slate-400">
                                  Relevance: {Math.round(source.relevance * 100)}%
                                </span>
                                {source.url && (
                                  <a href={source.url} className="text-blue-600 dark:text-blue-400 hover:underline">
                                    View →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Copy button for assistant messages */}
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
                                <Check className="h-3 w-3 mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
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
                  <div className="max-w-[80%] rounded-lg bg-slate-100 dark:bg-slate-800 p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500 delay-100"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500 delay-200"></div>
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
    </div>
  )
}
