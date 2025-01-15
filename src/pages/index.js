import { useState } from 'react'
import HardDriveAnalysis from '../components/HardDriveAnalysis'
import ThemeToggle from '../components/ThemeToggle'
import MemoryAnalysis from '../components/MemoryAnalysis'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-black/[.08] dark:border-white/[.145] p-4">
        <div className="max-w-5xl mx-auto flex justify-end">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <HardDriveAnalysis searchQuery={searchQuery} />
        <MemoryAnalysis />
      </div>
    </main>
  )
}
