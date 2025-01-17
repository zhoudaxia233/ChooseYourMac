import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HardDriveAnalysis from '../index'

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: str => str,
  }),
}))

// Mock fetch responses
const mockFetchResponses = {
  '/software-data.json': {
    software: [
      {
        id: 'vscode',
        name: 'VS Code',
        size: '500 MB',
        category: 'Development',
      },
      {
        id: 'chrome',
        name: 'Chrome',
        size: '537.5 MB',
        category: 'Utilities',
      },
    ],
    system: {
      os: {
        name: 'Operating System',
        size: '15 GB',
      },
      preinstalled: {
        name: 'Pre-installed Apps',
        size: '10 GB',
      },
      upgrade_space: {
        name: 'Reserved Space for macOS upgrades',
        size: '35.5 GB',
      },
    },
    categories: [
      {
        id: 'development',
        name: 'Development',
        order: 1,
      },
      {
        id: 'utilities',
        name: 'Utilities',
        order: 2,
      },
    ],
  },
  '/presets.json': {
    presets: [
      {
        id: 'basic',
        name: 'Basic',
        software: ['chrome'],
      },
      {
        id: 'development',
        name: 'Development',
        software: ['vscode'],
      },
    ],
  },
}

// Mock fetch
global.fetch = jest.fn(url =>
  Promise.resolve({
    json: () => Promise.resolve(mockFetchResponses[url]),
  })
)

describe('HardDriveAnalysis Component', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('Info Section', () => {
    test('info section is initially collapsed', async () => {
      render(<HardDriveAnalysis />)

      // Wait for component to load
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /about software sizes/i,
          })
        ).toBeInTheDocument()
      })

      const infoButton = screen.getByRole('button', {
        name: /about software sizes/i,
      })
      expect(infoButton).toBeInTheDocument()

      const infoContent = screen.getByText(/the listed sizes for all software/i)
      expect(infoContent.closest('div')).toHaveClass('opacity-0')
      expect(infoContent.closest('div')).toHaveClass('max-h-0')
    })

    test('expands and collapses info section when clicking the button', async () => {
      const user = userEvent.setup()
      render(<HardDriveAnalysis />)

      // Wait for component to load
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /about software sizes/i,
          })
        ).toBeInTheDocument()
      })

      const infoButton = screen.getByRole('button', {
        name: /about software sizes/i,
      })
      const infoContainer = screen
        .getByText(/the listed sizes for all software/i)
        .closest('div')

      // Initial state - collapsed
      expect(infoContainer).toHaveClass('opacity-0', 'max-h-0')

      // Click to expand
      await user.click(infoButton)
      await waitFor(() => {
        expect(infoContainer).toHaveClass('opacity-100', 'max-h-48')
      })

      // Click to collapse
      await user.click(infoButton)
      await waitFor(() => {
        expect(infoContainer).toHaveClass('opacity-0', 'max-h-0')
      })
    })

    test('info section contains the correct explanation text', async () => {
      render(<HardDriveAnalysis />)

      // Wait for component to load
      await waitFor(() => {
        expect(
          screen.getByText(/the listed sizes for all software/i)
        ).toBeInTheDocument()
      })

      const explanation = screen.getByText(/the listed sizes for all software/i)
      expect(explanation).toHaveTextContent(
        /the listed sizes for all software are generally much higher than their fresh installation sizes/i
      )
      expect(explanation).toHaveTextContent(
        /these specific numbers are derived from various sources/i
      )
    })

    test('chevron icon rotates when info section is expanded', async () => {
      const user = userEvent.setup()
      render(<HardDriveAnalysis />)

      // Wait for component to load
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /about software sizes/i,
          })
        ).toBeInTheDocument()
      })

      const infoButton = screen.getByRole('button', {
        name: /about software sizes/i,
      })
      const chevronIcon = infoButton.querySelector('svg:last-child')

      // Initial state - not rotated
      expect(chevronIcon).not.toHaveClass('rotate-180')

      // Click to expand
      await user.click(infoButton)
      await waitFor(() => {
        expect(chevronIcon).toHaveClass('rotate-180')
      })

      // Click to collapse
      await user.click(infoButton)
      await waitFor(() => {
        expect(chevronIcon).not.toHaveClass('rotate-180')
      })
    })
  })
})
