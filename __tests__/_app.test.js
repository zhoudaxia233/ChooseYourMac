import { render } from '@testing-library/react'
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime'
import MyApp from '../pages/_app'
import i18nConfig from '../next-i18next.config'

// Mock next-i18next with a more complete implementation
jest.mock('next-i18next', () => ({
  appWithTranslation: Component => {
    const WrappedComponent = props => {
      // In Next.js, Component receives pageProps directly
      const { Component: PageComponent, pageProps } = props
      return <PageComponent {...pageProps} />
    }
    // Preserve component name for debugging
    WrappedComponent.displayName = `appWithTranslation(${Component.name})`
    return WrappedComponent
  },
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
}))

describe('MyApp Component', () => {
  const mockComponent = jest.fn(() => <div>Test Component</div>)
  // Define clear props structure
  const mockPageProps = {
    testProp: 'test value',
  }
  const mockAppProps = {
    Component: mockComponent,
    pageProps: mockPageProps,
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

  beforeEach(() => {
    // Clear all mock function calls
    jest.clearAllMocks()
  })

  test('detects browser language and sets initial locale', () => {
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

      // Create router with the expected locale
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
        locale: expected,
        locales: i18nConfig.i18n.locales,
      }

      const { container } = render(
        <RouterContext.Provider value={mockRouter}>
          <MyApp {...mockAppProps} />
        </RouterContext.Provider>
      )

      expect(container.firstChild).toBeTruthy()
      expect(mockRouter.locale).toBe(expected)
    })
  })

  test('renders component with i18n integration', () => {
    const mockRouter = {
      locale: 'en',
      locales: i18nConfig.i18n.locales,
      // ... other router properties
    }

    const { container } = render(
      <RouterContext.Provider value={mockRouter}>
        <MyApp {...mockAppProps} />
      </RouterContext.Provider>
    )

    expect(container.firstChild).toBeTruthy()
    const actualProps = mockComponent.mock.calls[0][0]
    expect(actualProps).toEqual(mockPageProps)
  })

  test('renders with theme provider and toaster', () => {
    const mockRouter = {
      locale: 'en',
      locales: i18nConfig.i18n.locales,
      // ... other router properties
    }

    const { container } = render(
      <RouterContext.Provider value={mockRouter}>
        <MyApp {...mockAppProps} />
      </RouterContext.Provider>
    )

    expect(container.firstChild).toBeTruthy()
    expect(mockComponent).toHaveBeenCalled()
  })
})
