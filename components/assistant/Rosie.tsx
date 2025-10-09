'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react'

export type RosieRole = 'user' | 'assistant'

export interface RosieMessage {
  id: string
  role: RosieRole
  content: string
  createdAt: number
}

const STORAGE_KEY = 'trs-rosie-thread-v1'

const quickPrompts: { title: string; description: string; prompt: string }[] = [
  {
    title: 'Client pulse',
    description: 'Check the latest context for ACME',
    prompt: "What's the latest on Acme?",
  },
  {
    title: 'Operator mode',
    description: 'Draft an update email for Helio',
    prompt: 'Generate a quick status email for Helio Systems.',
  },
  {
    title: 'Pipeline risk',
    description: 'Surface revenue risk this week',
    prompt: "Summarize pipeline risk this week and call out any guardrails we broke.",
  },
  {
    title: 'Industry intel',
    description: 'Scan the financial aid market',
    prompt: "Any news in the financial-aid space that could impact our clients?",
  },
]

function createMessage(role: RosieRole, content: string): RosieMessage {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${role}-${Date.now()}`
  return { id, role, content, createdAt: Date.now() }
}

export default function Rosie() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<RosieMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const stored = JSON.parse(raw) as RosieMessage[]
      if (Array.isArray(stored) && stored.length) {
        setMessages(stored)
      }
    } catch (error) {
      console.warn('Rosie: unable to load session', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const payload = JSON.stringify(messages)
      window.localStorage.setItem(STORAGE_KEY, payload)
    } catch (error) {
      console.warn('Rosie: unable to persist session', error)
    }
  }, [messages])

  useEffect(() => {
    if (!open) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const handleToggle = useCallback(() => {
    setOpen((state) => {
      if (state) {
        abortRef.current?.abort()
        abortRef.current = null
        setIsStreaming(false)
      }
      return !state
    })
  }, [])

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isStreaming) return
      const trimmed = message.trim()
      const userMessage = createMessage('user', trimmed)
      setMessages((prev) => [...prev, userMessage])
      setInput('')

      const controller = new AbortController()
      abortRef.current = controller
      setIsStreaming(true)

      try {
        const response = await fetch('/api/rosie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error('Rosie is unavailable right now.')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let done = false

        setMessages((prev) => [...prev, createMessage('assistant', '')])

        while (!done) {
          const { value, done: streamDone } = await reader.read()
          done = streamDone
          const chunk = value ? decoder.decode(value, { stream: !done }) : ''
          if (chunk) {
            buffer += chunk
            setMessages((prev) => {
              if (!prev.length) return prev
              const next = [...prev]
              const last = next[next.length - 1]
              if (last.role === 'assistant') {
                next[next.length - 1] = { ...last, content: buffer }
              }
              return next
            })
          }
        }
      } catch (error) {
        console.error('Rosie send error', error)
        setMessages((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last?.role === 'assistant' && !last.content) {
            next.pop()
          }
          next.push(
            createMessage(
              'assistant',
              'I hit a snag reaching the reasoning service. Give it another shot in a moment.',
            ),
          )
          return next
        })
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [isStreaming, messages],
  )

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      await sendMessage(input)
    },
    [input, sendMessage],
  )

  const handlePromptClick = useCallback(
    (prompt: string) => {
      setInput(prompt)
      setTimeout(() => {
        void sendMessage(prompt)
      }, 0)
    },
    [sendMessage],
  )

  const hasMessages = messages.length > 0
  const statusLabel = useMemo(() => (isStreaming ? 'Thinking' : 'Ready'), [isStreaming])

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-lg transition hover:shadow-xl"
          aria-label="Open Rosie assistant"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white">
            <Bot size={16} />
          </span>
          Rosie
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" aria-hidden onClick={handleToggle} />
          <section
            className="relative z-50 flex h-full w-full flex-col bg-white shadow-2xl transition sm:max-w-md"
            role="dialog"
            aria-modal="true"
            aria-label="Rosie assistant"
          >
            <header className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white">
                  <Bot size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Rosie — TRS Operator</p>
                  <p className="text-xs text-gray-500">{statusLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close Rosie"
              >
                <X size={16} />
              </button>
            </header>

            <main className="flex-1 overflow-y-auto px-5 py-4">
              {!hasMessages && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles size={16} className="text-emerald-500" />
                    Rosie is wired into RevenueOS data and actions. Try one of these to get started.
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {quickPrompts.map((item) => (
                      <button
                        key={item.prompt}
                        type="button"
                        onClick={() => handlePromptClick(item.prompt)}
                        className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasMessages && (
                <div className="space-y-4 text-sm text-gray-800">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col gap-1">
                      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </main>

            <footer className="border-t border-gray-100 px-5 py-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          void sendMessage(input)
                        }
                      }}
                      placeholder="Ask Rosie to retrieve context, draft an email, or run an analysis..."
                      className="h-20 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
                      disabled={isStreaming}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isStreaming || !input.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition disabled:opacity-40"
                    aria-label="Send message"
                  >
                    {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <MessageCircle size={12} />
                    Rosie can action intents like search, summarize, or compose. She will confirm before executing changes.
                  </div>
                  <span>Shift + Enter for newline</span>
                </div>
              </form>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
