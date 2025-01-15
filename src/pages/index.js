import { useState, useEffect } from 'react'
import Head from 'next/head'
import HardDriveAnalysis from '../components/HardDriveAnalysis'
import ThemeToggle from '../components/ThemeToggle'
import MemoryAnalysis from '../components/MemoryAnalysis'
import { getDaysSinceDate } from '../utils/dateUtils'
import FeedbackButton from '../components/FeedbackButton'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [daysSinceUpdate, setDaysSinceUpdate] = useState(0)
  const [lastUpdatedUTC, setLastUpdatedUTC] = useState('')

  useEffect(() => {
    fetch('/api/last-updated')
      .then(response => response.json())
      .then(data => {
        setDaysSinceUpdate(getDaysSinceDate(data.lastUpdated))
        setLastUpdatedUTC(data.formattedUTC)
      })
      .catch(error => console.error('Error loading last update:', error))
  }, [])

  return (
    <>
      <Head>
        <title>ChooseYourMac - Storage & Memory Calculator</title>
        <meta
          name="description"
          content="The easiest MacBook buying guide for budget-conscious users. Find your perfect MacBook without overspending with our intuitive tools for storage and memory performance."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

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

        {/* Footer */}
        <div className="border-t border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="space-x-4">
              <span>Last updated: {daysSinceUpdate} days ago</span>
              <span>({lastUpdatedUTC})</span>
            </div>
            <span>© 2024 ChooseYourMac</span>
          </div>
        </div>

        <FeedbackButton />
      </main>
    </>
  )
}
