'use client'

import { useState } from 'react'

export function ChatbotBubble() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        aria-label="Open AI assistant"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-orange-500 text-white shadow-xl hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
      >
        AI
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[360px] max-w-[90vw] rounded-2xl border bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b p-3">
            <div className="font-medium">TRS Assistant</div>
            <button onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>
          <div className="h-64 overflow-y-auto p-3 text-sm">
            <div className="text-gray-500">
              Ask about pipeline, pricing, projects, or finance. This widget is global.
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // TODO: send message to backend
            }}
            className="flex gap-2 border-t p-3"
          >
            <input className="flex-1 rounded-md border px-3 py-2 text-sm" placeholder="Type a question…" />
            <button className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
