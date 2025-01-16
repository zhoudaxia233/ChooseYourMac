import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeedbackButton from '../index'

describe('FeedbackButton Component', () => {
  let user

  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn()
    // Reset timers
    jest.useFakeTimers()
    // Setup userEvent once
    user = userEvent.setup({ delay: null })
  })

  afterEach(() => {
    jest.clearAllMocks()
    // Wrap timer cleanup in act
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  test('renders feedback button initially', () => {
    render(<FeedbackButton />)
    expect(
      screen.getByRole('button', { name: /open feedback form/i })
    ).toBeInTheDocument()
  })

  test('opens feedback form when clicked', async () => {
    render(<FeedbackButton />)

    await user.click(
      screen.getByRole('button', { name: /open feedback form/i })
    )

    // Use role and name to be more specific
    expect(
      screen.getByRole('heading', { name: /send feedback/i })
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('What could be improved?')
    ).toBeInTheDocument()
  }, 10000)

  test('closes feedback form when close button is clicked', async () => {
    render(<FeedbackButton />)

    // Open form
    await user.click(
      screen.getByRole('button', { name: /open feedback form/i })
    )
    // Close form
    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(
      screen.queryByRole('heading', { name: /send feedback/i })
    ).not.toBeInTheDocument()
  }, 10000)

  test('submits feedback successfully', async () => {
    // Mock successful fetch response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ message: 'Feedback submitted successfully' }),
    })

    render(<FeedbackButton />)

    // Open form
    await user.click(
      screen.getByRole('button', { name: /open feedback form/i })
    )

    // Type feedback
    const textarea = screen.getByPlaceholderText('What could be improved?')
    await user.type(textarea, 'Test feedback')

    // Submit form
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledWith('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String),
    })

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument()
    })

    // Wrap timer in act
    await act(async () => {
      jest.advanceTimersByTime(3000)
    })

    expect(
      screen.queryByText('Thanks for your feedback!')
    ).not.toBeInTheDocument()
  }, 10000)

  test('handles submission error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    global.fetch.mockRejectedValueOnce(new Error('Failed to submit'))

    render(<FeedbackButton />)

    await user.click(
      screen.getByRole('button', { name: /open feedback form/i })
    )

    const textarea = screen.getByPlaceholderText('What could be improved?')
    await user.type(textarea, 'Test feedback')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  }, 10000)

  test('sanitizes feedback before submission', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    })

    render(<FeedbackButton />)

    await user.click(
      screen.getByRole('button', { name: /open feedback form/i })
    )

    const textarea = screen.getByPlaceholderText('What could be improved?')
    await user.type(textarea, '<script>alert("xss")</script> & test')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    // Update expectation to match actual sanitization behavior
    const sentData = JSON.parse(fetch.mock.calls[0][1].body)
    expect(sentData.feedback).toBe('alert(&quot;xss&quot;) &amp; test')
  }, 10000)

  test('disables submit button when feedback is empty', async () => {
    render(<FeedbackButton />)

    await user.click(
      screen.getByRole('button', { name: /open feedback form/i })
    )

    const submitButton = screen.getByRole('button', { name: /send feedback/i })
    expect(submitButton).toBeDisabled()

    const textarea = screen.getByPlaceholderText('What could be improved?')
    await user.type(textarea, 'test')
    expect(submitButton).not.toBeDisabled()

    await user.clear(textarea)
    expect(submitButton).toBeDisabled()
  }, 10000)
})
