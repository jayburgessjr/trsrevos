"use client"

import { Bell, Download, Search } from "lucide-react"
import Image from "next/image"

export default function GlobalHeader() {
  return (
    <header className="border-b border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800">
      <div className="h-16 px-3 w-full flex items-center gap-3">
        <div className="relative flex items-center h-10">
          <Image
            src="/images/trs-logo.png"
            alt="The Revenue Scientists"
            width={312}
            height={50}
            className="object-contain h-10 w-auto"
            priority
          />
        </div>
        <div className="ml-2 flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-800 flex-1 max-w-xl bg-white dark:bg-gray-900">
          <Search size={16} className="text-gray-500 dark:text-gray-400" />
          <input placeholder="Search accounts, deals…" className="flex-1 outline-none text-sm text-gray-900 dark:text-gray-100 bg-transparent placeholder:text-gray-500 dark:placeholder:text-gray-400" />
        </div>
        <button className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
          <Download size={16} /> Download
        </button>
        <button className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
          <Bell size={16} />
        </button>
        <button className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors" aria-label="User menu" />
      </div>
    </header>
  )
}
