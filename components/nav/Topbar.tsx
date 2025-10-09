'use client'

export default function Topbar() {
  return (
    <header className="h-14 border-b border-gray-200 dark:border-neutral-800 flex items-center">
      <div className="w-full px-4 flex items-center justify-between">
        <div className="text-sm font-medium">TRS Internal SaaS</div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium">TRS Copilot</span>
            <span className="rounded-full border px-2 py-[2px] text-[10px] text-gray-600 dark:text-neutral-400 dark:border-neutral-700 border-gray-200">
              Internal
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-xs text-gray-500 dark:text-neutral-400">TRS Score</div>
            <div className="w-44 h-2 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
              <div className="h-full w-2/3 bg-[var(--trs-accent)]" />
            </div>
          </div>
          <button className="text-xs rounded-md border px-3 py-1 border-[var(--trs-accent)] text-[var(--trs-accent)]">
            ⌘K
          </button>
        </div>
      </div>
    </header>
  )
}
