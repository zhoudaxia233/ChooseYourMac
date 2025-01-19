import ThemeToggle from './ThemeToggle'
import LanguageSelector from './LanguageSelector'
import FeedbackButton from './FeedbackButton'

export default function Layout({ children, daysSinceUpdate, lastUpdatedUTC }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-black/[.08] dark:border-white/[.145] p-4">
        <div className="max-w-5xl mx-auto flex justify-end items-center gap-4">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">{children}</div>

      {/* Footer */}
      <div className="border-t border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="space-x-4">
            <span>Last updated: {daysSinceUpdate} days ago</span>
            <span>({lastUpdatedUTC})</span>
          </div>
          <span>© 2025 ChooseYourMac</span>
        </div>
      </div>
    </div>
  )
}
