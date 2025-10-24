'use client'

import { useState } from 'react'
import { Brain, Send, Sparkles } from 'lucide-react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Textarea } from '@/ui/textarea'
import type { Document } from '@/lib/revos/types'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type TRSBrainChatProps = {
  documentContext?: Document
}

function FormattedText({ content }: { content: string }) {
  const renderContent = () => {
    const lines = content.split('\n')
    const elements: JSX.Element[] = []

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-sm font-bold mt-3 mb-1">
            {line.replace('### ', '')}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-base font-bold mt-3 mb-1">
            {line.replace('## ', '')}
          </h2>
        )
      }
      // Bold text
      else if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/)
        elements.push(
          <p key={index} className="mb-2 text-xs">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>
              }
              return <span key={i}>{part}</span>
            })}
          </p>
        )
      }
      // Bullet points
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-4 mb-1 text-xs">
            {line.trim().substring(2)}
          </li>
        )
      }
      // Empty lines
      else if (line.trim() === '') {
        elements.push(<br key={index} />)
      }
      // Regular text
      else {
        elements.push(
          <p key={index} className="mb-2 text-xs">
            {line}
          </p>
        )
      }
    })

    return elements
  }

  return <div>{renderContent()}</div>
}

export default function TRSBrainChat({ documentContext }: TRSBrainChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Prepare context message if document is provided
      const contextMessage = documentContext
        ? `Context: I'm viewing a document titled "${documentContext.title}" (Type: ${documentContext.type}, Status: ${documentContext.status}). Here's my question: ${userInput}`
        : userInput

      const response = await fetch('/api/brain/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contextMessage, threadId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      setThreadId(data.threadId)

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="border-[#015e32]/20">
      <CardHeader className="border-b border-border bg-gradient-to-br from-[#015e32]/5 to-[#fd8216]/5">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#015e32]" />
          <CardTitle className="text-lg font-semibold">TRS Brain</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Ask questions about this document, related frameworks, or TRS knowledge
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Messages */}
        <div className="space-y-3 min-h-[250px] max-h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[250px] text-center px-4">
              <Sparkles className="h-8 w-8 text-[#fd8216] mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Ask TRS Brain</p>
              <p className="text-xs text-muted-foreground">
                Get insights about this document, related content, or TRS frameworks
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-[#015e32] text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <FormattedText content={message.content} />
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
              <div className="max-w-[85%] rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#015e32]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#015e32] delay-100"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#015e32] delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Context Badge */}
        {documentContext && (
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="bg-[#015e32]/10 text-[#015e32]">
              <Sparkles className="h-3 w-3 mr-1" />
              Document Context Active
            </Badge>
          </div>
        )}

        {/* Input Area */}
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about this document..."
            rows={3}
            className="resize-none text-sm"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="w-full bg-[#015e32] hover:bg-[#01753d] text-white"
            size="sm"
          >
            {isLoading ? (
              'Thinking...'
            ) : (
              <>
                <Send className="h-3 w-3 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
