"use client"

import { Bell, Download, Search } from "lucide-react"
import Image from "next/image"

export default function GlobalHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="h-14 px-3 w-full flex items-center gap-3">
        <div className="relative h-8 w-auto">
          <Image
            src="/images/trs-logo.png"
            alt="The Revenue Scientists"
            width={180}
            height={32}
            className="object-contain"
            priority
          />
        </div>
        <div className="ml-2 flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 flex-1 max-w-xl bg-white">
          <Search size={16} className="text-gray-500" />
          <input placeholder="Search accounts, deals…" className="flex-1 outline-none text-sm text-gray-900 bg-transparent" />
        </div>
        <button className="h-9 px-3 rounded-lg border border-gray-200 flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={16} /> Download
        </button>
        <button className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors">
          <Bell size={16} />
        </button>
        <button className="h-9 w-9 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" aria-label="User menu" />
      </div>
    </header>
  )
}
