import { useState } from 'react'
import { useTranslation } from 'next-i18next'

export default function FeedbackButton() {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState('idle')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const sanitizeFeedback = text => {
    // Remove HTML tags and scripts
    return (
      text
        .replace(/<[^>]*>/g, '')
        // Escape special characters
        .replace(
          /[&<>"'/]/g,
          char =>
            ({
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#39;',
              '/': '&#x2F;',
            }[char])
        )
    )
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const trimmedFeedback = feedback.trim()
    if (!trimmedFeedback) return

    setStatus('submitting')
    try {
      const sanitizedFeedback = sanitizeFeedback(trimmedFeedback)
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: sanitizedFeedback,
          locale: navigator.language || navigator.userLanguage || 'unknown',
        }),
      })

      if (!response.ok) throw new Error('Failed to submit feedback')

      // Immediately close the form
      setIsOpen(false)
      setStatus('success')
      setFeedback('')
      setShowSuccessMessage(true)

      // Hide success message after delay
      setTimeout(() => {
        setShowSuccessMessage(false)
        setStatus('idle')
      }, 3000)
    } catch (error) {
      setStatus('error')
      console.error('Error submitting feedback:', error)
    }
  }

  return (
    <>
      {showSuccessMessage && (
        <div
          className="fixed bottom-20 right-4 bg-green-500/90 backdrop-blur-sm text-white 
            px-4 py-2 rounded-full shadow-lg animate-fade-in flex items-center gap-2 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{t('thanks')}</span>
        </div>
      )}

      <div className="fixed bottom-4 right-4">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors"
          >
            <span className="sr-only">{t('feedback')}</span>
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('feedback')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder={t('placeholder')}
                maxLength={1000}
                className="w-full h-32 px-3 py-2 text-gray-700 dark:text-gray-300 
                  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={status === 'submitting'}
              />
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={status === 'submitting' || !feedback.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 
                    rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? t('sending') : t('submit')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  )
}
