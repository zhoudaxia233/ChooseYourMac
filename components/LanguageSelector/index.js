import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
]

export default function LanguageSelector() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentLanguage =
    languages.find(lang => lang.code === router.locale) || languages[0]

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const switchLanguage = async locale => {
    setIsOpen(false)
    const { pathname, asPath, query } = router
    await router.push({ pathname, query }, asPath, { locale })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 
          dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
          flex items-center gap-1"
        aria-label="Select language"
        data-testid="language-selector"
      >
        <span className="text-sm font-medium">{currentLanguage.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
        <div
          className="absolute right-0 mt-2 py-1 w-32 
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700
            rounded-lg shadow-lg z-50"
          data-testid="language-dropdown"
        >
          {languages.map(language => (
            <button
              key={language.code}
              onClick={() => switchLanguage(language.code)}
              className={`w-full px-4 py-2 text-left text-sm
                hover:bg-gray-50 dark:hover:bg-gray-700
                ${
                  language.code === currentLanguage.code
                    ? 'text-blue-500 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                }
                transition-colors duration-200`}
              data-testid={`language-option-${language.code}`}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
