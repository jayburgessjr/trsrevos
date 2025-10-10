"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Archive, ArrowLeftRight, Inbox, Loader2, MailPlus, RefreshCw, Reply, Trash2 } from "lucide-react"

import type { GmailMessageDetail, GmailMessageSummary } from "@/lib/gmail/messages"
import { Button } from "@/components/ui/button"
import { Input } from "@/ui/input"
import { Textarea } from "@/ui/textarea"

type MailConsoleProps = {
  connected: boolean
}

type FetchState = "idle" | "loading" | "error"

type OperationStatus = {
  type: "success" | "error"
  message: string
} | null

export function MailConsole({ connected }: MailConsoleProps) {
  const [messages, setMessages] = useState<GmailMessageSummary[]>([])
  const [fetchState, setFetchState] = useState<FetchState>("idle")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageDetail | null>(null)
  const [messageLoading, setMessageLoading] = useState(false)
  const [operationStatus, setOperationStatus] = useState<OperationStatus>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeTo, setComposeTo] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")
  const [composePending, setComposePending] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyBody, setReplyBody] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!connected) {
      return
    }

    loadMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected])

  const loadMessages = async () => {
    setFetchState("loading")
    setOperationStatus(null)
    try {
      const response = await fetch("/api/gmail/messages", { cache: "no-store" })
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`)
      }
      const data = (await response.json()) as { messages: GmailMessageSummary[] }
      setMessages(data.messages ?? [])
      if (data.messages?.length) {
        await selectMessage(data.messages[0].id)
      } else {
        setSelectedId(null)
        setSelectedMessage(null)
      }
      setFetchState("idle")
    } catch (error) {
      console.error(error)
      setFetchState("error")
    }
  }

  const refreshMessages = async () => {
    setRefreshing(true)
    try {
      await loadMessages()
    } finally {
      setRefreshing(false)
    }
  }

  const selectMessage = async (id: string) => {
    setSelectedId(id)
    setMessageLoading(true)
    setReplyOpen(false)
    setReplyBody("")
    setOperationStatus(null)

    try {
      const response = await fetch(`/api/gmail/messages/${id}`, { cache: "no-store" })
      if (!response.ok) {
        if (response.status === 404) {
          setOperationStatus({ type: "error", message: "Message not found or already removed." })
          return
        }
        throw new Error(`Failed to fetch message ${id}`)
      }
      const data = (await response.json()) as { message: GmailMessageDetail }
      setSelectedMessage(data.message)
    } catch (error) {
      console.error(error)
      setOperationStatus({ type: "error", message: "Unable to load this message." })
    } finally {
      setMessageLoading(false)
    }
  }

  const archiveMessage = async (id: string) => {
    setOperationStatus(null)
    try {
      const response = await fetch(`/api/gmail/messages/${id}/archive`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Archive failed")
      }
      setMessages((prev) => prev.filter((msg) => msg.id !== id))
      if (selectedId === id) {
        setSelectedId(null)
        setSelectedMessage(null)
      }
      setOperationStatus({ type: "success", message: "Conversation archived." })
    } catch (error) {
      console.error(error)
      setOperationStatus({ type: "error", message: "Unable to archive this conversation." })
    }
  }

  const deleteMessage = async (id: string) => {
    setOperationStatus(null)
    try {
      const response = await fetch(`/api/gmail/messages/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Delete failed")
      }
      setMessages((prev) => prev.filter((msg) => msg.id !== id))
      if (selectedId === id) {
        setSelectedId(null)
        setSelectedMessage(null)
      }
      setOperationStatus({ type: "success", message: "Conversation moved to trash." })
    } catch (error) {
      console.error(error)
      setOperationStatus({ type: "error", message: "Unable to delete this conversation." })
    }
  }

  const sendNewMessage = async () => {
    setComposePending(true)
    setOperationStatus(null)
    try {
      const response = await fetch("/api/gmail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
        }),
      })

      if (!response.ok) {
        throw new Error("Send failed")
      }

      setComposeTo("")
      setComposeSubject("")
      setComposeBody("")
      setComposeOpen(false)
      setOperationStatus({ type: "success", message: "Email sent." })
      await refreshMessages()
    } catch (error) {
      console.error(error)
      setOperationStatus({ type: "error", message: "Unable to send email." })
    } finally {
      setComposePending(false)
    }
  }

  const sendReply = async () => {
    if (!selectedId || !selectedMessage) {
      return
    }

    setOperationStatus(null)
    setReplyOpen(false)

    try {
      const response = await fetch(`/api/gmail/messages/${selectedId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedMessage.from ?? selectedMessage.to ?? "",
          subject: selectedMessage.subject ?? "(no subject)",
          body: replyBody,
          threadId: selectedMessage.threadId,
          inReplyTo: selectedMessage.inReplyTo ?? undefined,
          references: selectedMessage.references ?? undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Reply failed")
      }

      setReplyBody("")
      setOperationStatus({ type: "success", message: "Reply sent." })
      await refreshMessages()
    } catch (error) {
      console.error(error)
      setOperationStatus({ type: "error", message: "Unable to send reply." })
    }
  }

  const formattedMessages = useMemo(() => {
    return messages.map((message) => ({
      ...message,
      displayDate: message.internalDate
        ? new Intl.DateTimeFormat(undefined, {
            dateStyle: "short",
            timeStyle: "short",
          }).format(new Date(message.internalDate))
        : "",
    }))
  }, [messages])

  const renderedBody = useMemo(() => {
    if (!selectedMessage) {
      return ""
    }
    if (selectedMessage.body.text) {
      return selectedMessage.body.text
    }
    if (selectedMessage.body.html) {
      return selectedMessage.body.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    }
    return selectedMessage.snippet
  }, [selectedMessage])

  if (!connected) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <Inbox className="mx-auto h-10 w-10 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900">Connect Gmail to view your inbox</h2>
        <p className="mx-auto max-w-2xl text-sm text-gray-600">
          Hook up Gmail Workspace to unlock live inbox visibility, agent-triggered replies, and governance workflows without
          leaving TRSREVOS.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/settings/integrations">Open Gmail wizard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid h-full gap-6 lg:grid-cols-[320px,1fr]">
      <aside className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Inbox</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setComposeOpen((value) => !value)}>
              <MailPlus className="mr-1 h-4 w-4" /> Compose
            </Button>
            <Button size="icon" variant="ghost" onClick={refreshMessages} disabled={refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {composeOpen ? (
          <div className="border-b border-gray-100 bg-gray-50 p-4 text-xs text-gray-600">
            <div className="space-y-2">
              <Input placeholder="To" value={composeTo} onChange={(event) => setComposeTo(event.target.value)} />
              <Input
                placeholder="Subject"
                value={composeSubject}
                onChange={(event) => setComposeSubject(event.target.value)}
              />
              <Textarea
                placeholder="Draft your message..."
                value={composeBody}
                onChange={(event) => setComposeBody(event.target.value)}
                rows={4}
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setComposeOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={sendNewMessage} disabled={composePending || !composeTo || !composeBody}>
                  {composePending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                  Send
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto">
          {fetchState === "loading" ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading messages...
            </div>
          ) : fetchState === "error" ? (
            <div className="space-y-2 p-4 text-xs text-red-600">
              <p>We couldn’t load your inbox.</p>
              <Button size="sm" variant="outline" onClick={loadMessages}>
                Retry
              </Button>
            </div>
          ) : formattedMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-gray-500">
              <Inbox className="h-10 w-10 text-gray-300" />
              <p>No recent messages.</p>
              <p className="text-xs">Compose a note or refresh to pull your latest conversations.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {formattedMessages.map((message) => {
                const isActive = selectedId === message.id
                return (
                  <li
                    key={message.id}
                    className={`cursor-pointer px-4 py-3 text-sm transition hover:bg-gray-50 ${
                      isActive ? "bg-emerald-50" : "bg-white"
                    }`}
                    onClick={() => selectMessage(message.id)}
                  >
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium text-gray-900">{message.from ?? "(No sender)"}</span>
                      <span>{message.displayDate}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{message.subject ?? "(No subject)"}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">{message.snippet}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>

      <section className="flex min-h-[520px] flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {selectedMessage?.subject ?? selectedMessage?.snippet ?? "Select a conversation"}
            </h2>
            <p className="text-xs text-gray-500">
              {selectedMessage?.from ? `From ${selectedMessage.from}` : "Choose a message to view details"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => (selectedId ? archiveMessage(selectedId) : undefined)}
              disabled={!selectedId}
            >
              <Archive className="mr-1 h-4 w-4" /> Archive
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => (selectedId ? deleteMessage(selectedId) : undefined)}
              disabled={!selectedId}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Trash
            </Button>
            <Button size="sm" onClick={() => setReplyOpen((value) => !value)} disabled={!selectedId}>
              <Reply className="mr-1 h-4 w-4" /> Reply
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 text-sm text-gray-700">
          {messageLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading conversation...
            </div>
          ) : selectedMessage ? (
            <article className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="font-medium text-gray-800">To:</span>
                <span>{selectedMessage.to ?? "(hidden recipients)"}</span>
              </div>
              {selectedMessage.cc ? (
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="font-medium text-gray-800">Cc:</span>
                  <span>{selectedMessage.cc}</span>
                </div>
              ) : null}
              <p className="whitespace-pre-wrap leading-6 text-gray-700">{renderedBody}</p>
            </article>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-gray-500">
              <ArrowLeftRight className="h-10 w-10 text-gray-300" />
              <p>Select a message to view its contents.</p>
            </div>
          )}
        </div>

        {replyOpen && selectedId ? (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900">Quick reply</h3>
            <Textarea
              className="mt-2"
              rows={4}
              placeholder="Write your response..."
              value={replyBody}
              onChange={(event) => setReplyBody(event.target.value)}
            />
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" onClick={sendReply} disabled={!replyBody}>
                Send reply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setReplyOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {operationStatus ? (
          <div
            className={`border-t px-6 py-3 text-xs ${
              operationStatus.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {operationStatus.message}
          </div>
        ) : null}
      </section>
    </div>
  )
}
