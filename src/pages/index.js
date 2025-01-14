import Image from 'next/image'
import { Geist, Geist_Mono } from 'next/font/google'
import { useState } from 'react'
import HardDriveAnalysis from '../components/HardDriveAnalysis/index'
import MemoryAnalysis from '../components/MemoryAnalysis/index'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-[family-name:var(--font-geist-sans)]`}
    >
      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-black/[.08] dark:border-white/[.145] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search software or memory configurations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              ⌘K
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex flex-col items-center p-8 pb-20 gap-8 sm:p-20">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <HardDriveAnalysis searchQuery={searchQuery} />
          <MemoryAnalysis searchQuery={searchQuery} />
        </div>

        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{' '}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              pages/index.js
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>
      </main>
    </div>
  )
}
