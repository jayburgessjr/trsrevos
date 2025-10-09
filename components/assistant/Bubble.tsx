'use client'

import { useState } from 'react'

export default function AssistantBubble() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full px-4 py-3 text-white"
        style={{ backgroundColor: '#ff6a00' }}
        aria-label="Open assistant"
      >
        Ask TRS
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">TRS Assistant</h3>
              <button className="text-sm" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              Chat UI placeholder. Future actions: compute plan, draft proposal, generate recap.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
