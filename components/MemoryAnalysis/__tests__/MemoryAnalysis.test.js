import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MemoryAnalysis from '../index'

// Mock the next-i18next module
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'memoryAnalysis.title': 'Memory Pressure Analysis',
        'memoryAnalysis.aboutEstimates': 'About Memory Estimates',
        'memoryAnalysis.performanceOverview': 'Memory Performance Overview',
        'memoryAnalysis.estimatesDescription':
          "The performance estimates are based on Apple's M-series unified memory architecture. These values are subjective approximations, gathered from forums and YouTube analyses, and are not standardized measurements.",
      }
      return translations[key] || key
    },
  }),
}))

// Mock fetch responses
const mockFetchResponses = {
  '/memory-data.json': {
    memoryOptions: [8, 16, 24, 32, 48, 64, 128],
    scenarios: [
      {
        id: 'gaming',
        name: 'Gaming',
        icon: '🎮',
        basePressure: 85,
        status: 'high',
        apps: [
          { name: 'Steam', icon: '🎮' },
          { name: 'Discord', icon: '🗨️' },
        ],
        pressureByMemory: {
          8: 95,
          16: 85,
          24: 70,
          32: 60,
          48: 50,
          64: 40,
          128: 30,
        },
        recommendations: {
          16: {
            text: 'Upgrade to 24GB for optimal gaming',
            upgrade: true,
          },
        },
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

describe('MemoryAnalysis Component', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('Info Section', () => {
    test('info section is initially collapsed', async () => {
      render(<MemoryAnalysis />)

      // Wait for component to load
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /about memory estimates/i,
          })
        ).toBeInTheDocument()
      })

      const infoButton = screen.getByRole('button', {
        name: /about memory estimates/i,
      })
      expect(infoButton).toBeInTheDocument()

      const infoContent = screen.getByText(/the performance estimates/i)
      expect(infoContent.closest('div')).toHaveClass('opacity-0')
      expect(infoContent.closest('div')).toHaveClass('max-h-0')
    })

    test('expands and collapses info section when clicking the button', async () => {
      const user = userEvent.setup()
      render(<MemoryAnalysis />)

      // Wait for component to load
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /about memory estimates/i,
          })
        ).toBeInTheDocument()
      })

      const infoButton = screen.getByRole('button', {
        name: /about memory estimates/i,
      })
      const infoContainer = screen
        .getByText(/the performance estimates/i)
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
      render(<MemoryAnalysis />)

      // Wait for component to load
      await waitFor(() => {
        expect(
          screen.getByText(/the performance estimates/i)
        ).toBeInTheDocument()
      })

      const explanation = screen.getByText(/the performance estimates/i)
      expect(explanation).toHaveTextContent(
        /the performance estimates are based on apple's m-series unified memory architecture/i
      )
      expect(explanation).toHaveTextContent(
        /these values are subjective approximations/i
      )
    })

    test('chevron icon rotates when info section is expanded', async () => {
      const user = userEvent.setup()
      render(<MemoryAnalysis />)

      // Wait for component to load
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /about memory estimates/i,
          })
        ).toBeInTheDocument()
      })

      const infoButton = screen.getByRole('button', {
        name: /about memory estimates/i,
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
