import { render } from '@testing-library/react'
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime'
import MyApp from '../pages/_app'

// Mock next-i18next
jest.mock('next-i18next', () => ({
  appWithTranslation: Component => Component,
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
}))

describe('MyApp Component', () => {
  const mockComponent = jest.fn(() => <div>Test Component</div>)
  const mockProps = { pageProps: {} }

  // Mock router
  const mockRouter = {
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
    locale: 'en',
    locales: ['en', 'zh', 'ja'],
  }

  const renderWithRouter = ui => {
    return render(
      <RouterContext.Provider value={mockRouter}>{ui}</RouterContext.Provider>
    )
  }

  beforeAll(() => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  test('detects browser language and sets initial locale', () => {
    // Mock navigator.language for different scenarios
    const scenarios = [
      { language: 'zh-CN', expected: 'zh' },
      { language: 'ja-JP', expected: 'ja' },
      { language: 'fr-FR', expected: 'en' }, // unsupported language should fallback to 'en'
      { language: 'en-US', expected: 'en' },
    ]

    scenarios.forEach(({ language, expected }) => {
      // Mock navigator.language
      Object.defineProperty(window.navigator, 'language', {
        value: language,
        configurable: true,
      })

      const { container } = renderWithRouter(
        <MyApp Component={mockComponent} {...mockProps} />
      )

      // Check if the defaultLocale prop is correctly passed
      expect(container.innerHTML).toContain('Test Component')
      expect(container.firstChild).toBeTruthy()

      // Verify the defaultLocale prop
      const props =
        mockComponent.mock.calls[mockComponent.mock.calls.length - 1][0]
      expect(props.defaultLocale).toBe(expected)
    })
  })

  test('renders language selector in the correct position', () => {
    const { container } = renderWithRouter(
      <MyApp Component={mockComponent} {...mockProps} />
    )

    const fixedDiv = container.querySelector('.fixed.top-4.right-4')
    expect(fixedDiv).toBeInTheDocument()
    expect(fixedDiv).toHaveClass('flex', 'items-center', 'gap-2', 'z-50')
  })
})
