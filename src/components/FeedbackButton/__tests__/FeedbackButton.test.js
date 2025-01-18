import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeedbackButton from '../index'
import { toast } from 'react-hot-toast'

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: str => str,
    i18n: { language: 'en' },
  }),
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

describe('FeedbackButton Component', () => {
  let consoleErrorSpy

  beforeAll(() => {
    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Setup default fetch mock
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    })
  })

  test('renders feedback button', () => {
    render(<FeedbackButton />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('opens feedback form on click', async () => {
    const user = userEvent.setup()
    render(<FeedbackButton />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByPlaceholderText('placeholder')).toBeInTheDocument()
  })

  test('submits feedback successfully', async () => {
    const user = userEvent.setup()
    render(<FeedbackButton />)

    // Open form
    await user.click(screen.getByRole('button'))

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('placeholder'), 'Test feedback')
    await user.click(screen.getByText('submit'))

    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledWith('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String),
    })

    // Verify the sent data
    const sentData = JSON.parse(fetch.mock.calls[0][1].body)
    expect(sentData).toEqual({
      text: 'Test feedback',
      locale: 'en',
    })

    // Verify success toast was shown
    expect(toast.success).toHaveBeenCalledWith('feedback.success')
  })

  test('handles submission error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))

    const user = userEvent.setup()
    render(<FeedbackButton />)

    await user.click(screen.getByRole('button'))
    await user.type(screen.getByPlaceholderText('placeholder'), 'Test feedback')
    await user.click(screen.getByText('submit'))

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error submitting feedback:',
      expect.any(Error)
    )
    // Verify error toast was shown
    expect(toast.error).toHaveBeenCalledWith('feedback.error')
  })

  test('validates empty feedback', async () => {
    const user = userEvent.setup()
    render(<FeedbackButton />)

    await user.click(screen.getByRole('button'))
    const submitButton = screen.getByText('submit')

    expect(submitButton).toBeDisabled()
  })
})
