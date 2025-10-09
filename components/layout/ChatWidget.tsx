"use client"

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { Bot, CornerDownLeft, Loader2 } from "lucide-react"
import {
  ExpandableChat,
  ExpandableChatBody,
  ExpandableChatFooter,
  ExpandableChatHeader,
} from "@/components/ui/expandable-chat"
import { ChatInput } from "@/components/ui/chat-input"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: number
  content: string
  sender: "user" | "ai"
}

function ChatAvatar({ sender }: { sender: ChatMessage["sender"] }) {
  const isUser = sender === "user"
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        isUser ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-700"
      )}
    >
      {isUser ? "You" : "TRS"}
    </div>
  )
}

function ChatMessageRow({
  sender,
  children,
}: {
  sender: ChatMessage["sender"]
  children: ReactNode
}) {
  const isUser = sender === "user"
  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <ChatAvatar sender={sender} />
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-slate-100 text-slate-900"
        )}
      >
        {children}
      </div>
    </div>
  )
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    content:
      "Hi there! I’m the TRS assistant. Ask anything about RevenueOS and we’ll route you to the right resource.",
    sender: "ai",
  },
  {
    id: 2,
    content:
      "Need a quick link? Try “pricing”, “pipeline”, or “partner support” and I’ll help you get started.",
    sender: "ai",
  },
]

export default function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading) {
      return
    }

    const timer = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: current.length + 1,
          sender: "ai",
          content:
            "Thanks for the note! A teammate will follow up shortly, and you can also email hello@therevenuesource.com for urgent requests.",
        },
      ])
      setIsLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [isLoading])

  useEffect(() => {
    const node = scrollRef.current
    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages, isLoading])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!input.trim()) {
      return
    }

    const sanitized = input.trim()

    setMessages((current) => [
      ...current,
      {
        id: current.length + 1,
        sender: "user",
        content: sanitized,
      },
    ])
    setInput("")
    setIsLoading(true)
  }

  return (
    <ExpandableChat
      className="print:hidden"
      size="lg"
      position="bottom-right"
      icon={<Bot className="h-6 w-6" />}
    >
      <ExpandableChatHeader className="flex-col items-start gap-1 bg-white/95">
        <h2 className="text-lg font-semibold">Chat with TRS</h2>
        <p className="text-sm text-muted-foreground">
          We’re online Monday–Friday and respond within a few minutes.
        </p>
      </ExpandableChatHeader>
      <ExpandableChatBody className="bg-white">
        <div ref={scrollRef} className="flex h-full flex-col gap-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <ChatMessageRow key={message.id} sender={message.sender}>
              {message.content}
            </ChatMessageRow>
          ))}
          {isLoading && (
            <ChatMessageRow sender="ai">
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Typing a response...
              </span>
            </ChatMessageRow>
          )}
        </div>
      </ExpandableChatBody>
      <ExpandableChatFooter className="bg-white">
        <form onSubmit={handleSubmit} className="space-y-2">
          <ChatInput
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question about RevenueOS"
            className="min-h-12 resize-none rounded-md border border-input bg-background p-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors",
                isLoading && "opacity-70"
              )}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Send
              <CornerDownLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  )
}
