"use client";

import { useState } from "react";

import { Button } from "@/ui/button";

export default function CoPilotDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="font-medium"
      >
        Ask Morning Agent
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Morning Agent</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Ask things like: &ldquo;What moved ARR yesterday?&rdquo;, &ldquo;What&apos;s the fastest
              way to lift win rate 10% this week?&rdquo;
            </div>
            <textarea
              className="mt-3 h-24 w-full rounded-md border p-2 text-sm"
              placeholder="Type your question…"
            />
            <div className="mt-3 flex justify-end">
              <Button size="sm">
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
