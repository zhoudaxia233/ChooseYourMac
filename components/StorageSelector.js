import { useState } from 'react'

const StorageSelector = ({ onStorageChange }) => {
  const options = [
    { size: '128GB', value: 128 },
    { size: '256GB', value: 256 },
    { size: '512GB', value: 512 },
    { size: '1TB', value: 1024 },
    { size: '2TB', value: 2048 },
  ]

  const [isOpen, setIsOpen] = useState(false)
  const [selectedStorage, setSelectedStorage] = useState(256)

  const formatStorage = value => {
    return value >= 1024 ? `${value / 1024}TB` : `${value}GB`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1 rounded-full 
          bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
          text-sm font-medium text-gray-600 dark:text-gray-400 
          transition-colors relative"
      >
        <span>{formatStorage(selectedStorage)}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 
              rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-40"
          >
            {options.map(option => (
              <button
                key={option.size}
                onClick={() => {
                  setSelectedStorage(option.value)
                  onStorageChange(option.value)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 
                  dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300
                  transition-colors"
              >
                {option.size} Storage
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default StorageSelector
