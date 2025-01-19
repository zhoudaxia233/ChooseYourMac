import { render, screen } from '@testing-library/react'
import Layout from '../Layout'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    basePath: '',
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
  }),
}))

// Mock next-i18next since Layout includes LanguageSelector
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: str => str,
    i18n: { language: 'en' },
  }),
}))

// Mock next-themes since Layout includes ThemeToggle
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}))

describe('Layout Component', () => {
  const defaultProps = {
    daysSinceUpdate: 5,
    lastUpdatedUTC: '2024-03-20',
  }

  test('renders feedback button', () => {
    render(<Layout {...defaultProps}>Content</Layout>)

    // Since the feedback button has a screen reader text, we can find it by that
    const feedbackButton = screen.getByRole('button', { name: /feedback/i })
    expect(feedbackButton).toBeInTheDocument()
  })

  test('renders other essential components', () => {
    render(<Layout {...defaultProps}>Test Content</Layout>)

    // Test if children content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument()

    // Test if last updated info is shown
    expect(screen.getByText(/Last updated: 5 days ago/)).toBeInTheDocument()
    expect(screen.getByText('(2024-03-20)')).toBeInTheDocument()

    // Test if copyright is shown
    expect(screen.getByText(/© 2025 ChooseYourMac/)).toBeInTheDocument()
  })
})
