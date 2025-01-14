import { useState } from 'react'
import HardDriveAnalysis from '../components/HardDriveAnalysis'
import MemoryOptions from '../components/MemoryOptions'
import ThemeToggle from '../components/ThemeToggle'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-black/[.08] dark:border-white/[.145] p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search software or memory configurations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] 
                  bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                ⌘K
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <HardDriveAnalysis searchQuery={searchQuery} />
        <MemoryOptions />
      </div>
    </main>
  )
}
