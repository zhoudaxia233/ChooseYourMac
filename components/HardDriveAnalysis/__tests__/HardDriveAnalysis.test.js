import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
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

// Mock matchMedia
beforeAll(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
})

afterAll(() => {
  delete window.matchMedia
})

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
        /the listed sizes for all software are generally much higher than the initial installation sizes/i
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

describe('HardDriveAnalysis - Sticky Progress Bar', () => {
  beforeEach(() => {
    fetch.mockClear()
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    })
  })

  it('should show sticky progress bar when main progress bar is scrolled out of view', async () => {
    render(<HardDriveAnalysis />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/GB used/)).toBeInTheDocument()
    })

    // Initially, sticky progress bar should not be visible
    expect(screen.queryAllByText(/GB used/)).toHaveLength(1) // Changed to queryAllByText

    // Mock the getBoundingClientRect for main progress bar
    const mainProgressBar = document.getElementById('main-progress-bar')
    const originalGetBoundingClientRect = mainProgressBar.getBoundingClientRect
    mainProgressBar.getBoundingClientRect = jest.fn(() => ({
      bottom: -10,
      height: 100,
      top: -110,
    }))

    // Trigger scroll event
    act(() => {
      fireEvent.scroll(window)
    })

    // Now we should see two progress bars (main + sticky)
    await waitFor(() => {
      expect(screen.queryAllByText(/GB used/)).toHaveLength(2)
    })

    // Simulate scrolling back up
    mainProgressBar.getBoundingClientRect = jest.fn(() => ({
      bottom: 100,
      height: 100,
      top: 0,
    }))

    // Trigger scroll event again
    act(() => {
      fireEvent.scroll(window)
    })

    // Should be back to only one progress bar
    await waitFor(() => {
      expect(screen.queryAllByText(/GB used/)).toHaveLength(1)
    })

    // Cleanup
    mainProgressBar.getBoundingClientRect = originalGetBoundingClientRect
  })

  it('should show correct storage information in sticky progress bar', async () => {
    render(<HardDriveAnalysis />)

    await waitFor(() => {
      expect(screen.getByText(/GB used/)).toBeInTheDocument()
    })

    const mainProgressBar = document.getElementById('main-progress-bar')
    const originalGetBoundingClientRect = mainProgressBar.getBoundingClientRect
    mainProgressBar.getBoundingClientRect = jest.fn(() => ({
      bottom: -10,
      height: 100,
      top: -110,
    }))

    // Trigger scroll event
    act(() => {
      fireEvent.scroll(window)
    })

    // Wait for sticky bar to appear and verify its properties
    await waitFor(() => {
      // Get the sticky container directly
      const stickyContainer = screen.getByTestId('sticky-progress-bar')
      expect(stickyContainer).toBeInTheDocument()
      expect(stickyContainer).toHaveClass('fixed')
      expect(stickyContainer).toHaveClass('top-0')
      expect(stickyContainer).toHaveClass('left-0')
      expect(stickyContainer).toHaveClass('w-full')
      expect(stickyContainer).toHaveClass('z-50')
      expect(stickyContainer).toHaveClass('shadow-md')

      // Verify storage information is displayed correctly
      const usageText = screen.getAllByText(/GB used/)[1]
      expect(usageText).toBeInTheDocument()

      // Verify progress bars container
      const progressBarContainer =
        stickyContainer.querySelector('.rounded-full')
      expect(progressBarContainer).toBeInTheDocument()
      expect(progressBarContainer).toHaveClass('bg-gray-100')
      expect(progressBarContainer).toHaveClass('dark:bg-gray-800')

      // Verify system space segments
      const progressBars = progressBarContainer.children
      expect(progressBars).toHaveLength(4) // OS, Pre-installed, Upgrade Space, User Space

      // OS Space
      const osSpace = progressBars[0]
      expect(osSpace).toHaveClass('bg-gray-300')
      expect(osSpace).toHaveClass('dark:bg-gray-600')
      expect(osSpace).toHaveStyle({
        width: '5.859375%', // 15GB / 256GB * 100
        borderRadius: '9999px 0 0 9999px',
      })

      // Pre-installed Apps
      const preinstalledSpace = progressBars[1]
      expect(preinstalledSpace).toHaveClass('bg-gray-400')
      expect(preinstalledSpace).toHaveClass('dark:bg-gray-500')
      expect(preinstalledSpace).toHaveStyle({
        width: '3.90625%', // 10GB / 256GB * 100
        left: '5.859375%',
      })

      // Upgrade Space
      const upgradeSpace = progressBars[2]
      expect(upgradeSpace).toHaveClass('bg-gray-500')
      expect(upgradeSpace).toHaveClass('dark:bg-gray-400')
      expect(upgradeSpace).toHaveStyle({
        width: '13.8671875%', // 35.5GB / 256GB * 100
        left: '9.765625%', // (15GB + 10GB) / 256GB * 100
      })

      // User Space (initially empty)
      const userSpace = progressBars[3]
      expect(userSpace).toHaveClass('relative')
      expect(userSpace).toHaveClass('bg-gradient-to-r')
      expect(userSpace).toHaveClass('from-blue-500')
      expect(userSpace).toHaveClass('to-blue-600')
      expect(userSpace).toHaveStyle({
        width: '0%',
        marginLeft: '23.6328125%', // (15GB + 10GB + 35.5GB) / 256GB * 100
      })
    })

    mainProgressBar.getBoundingClientRect = originalGetBoundingClientRect
  })

  it('should throttle scroll event handler', async () => {
    jest.useFakeTimers()

    render(<HardDriveAnalysis />)

    await waitFor(() => {
      expect(screen.getByText(/GB used/)).toBeInTheDocument()
    })

    const mainProgressBar = document.getElementById('main-progress-bar')
    const originalGetBoundingClientRect = mainProgressBar.getBoundingClientRect

    mainProgressBar.getBoundingClientRect = jest.fn(() => ({
      bottom: -10,
      height: 100,
      top: -110,
    }))

    // Trigger multiple scroll events rapidly
    for (let i = 0; i < 10; i++) {
      act(() => {
        fireEvent.scroll(window)
        jest.advanceTimersByTime(50) // 每次滚动后前进50ms
      })
    }

    // 等待节流时间结束
    act(() => {
      jest.advanceTimersByTime(100)
    })

    // 验证最终状态
    await waitFor(
      () => {
        expect(screen.queryAllByText(/GB used/)).toHaveLength(2)
      },
      { timeout: 1000 }
    )

    mainProgressBar.getBoundingClientRect = originalGetBoundingClientRect
    jest.useRealTimers()
  }, 10000) // 增加测试超时时间
})
