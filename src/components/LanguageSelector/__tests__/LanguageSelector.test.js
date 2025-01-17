import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'next-themes'
import LanguageSelector from '../index'

// Mock next/router
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    push: mockPush,
    pathname: '/',
    asPath: '/',
    query: {},
  }),
}))

// Mock matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // 废弃
      removeListener: jest.fn(), // 废弃
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
})

const renderWithTheme = (component, { theme = 'light' } = {}) => {
  return render(
    <ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}>
      {component}
    </ThemeProvider>
  )
}

describe('LanguageSelector Component', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    mockPush.mockClear()
  })

  test('renders language selector button', () => {
    renderWithTheme(<LanguageSelector />)
    expect(screen.getByTestId('language-selector')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  test('shows dropdown when clicked', async () => {
    renderWithTheme(<LanguageSelector />)

    await user.click(screen.getByTestId('language-selector'))

    expect(screen.getByTestId('language-dropdown')).toBeInTheDocument()
    expect(screen.getAllByText('English')).toHaveLength(2)
    expect(screen.getByText('中文')).toBeInTheDocument()
    expect(screen.getByText('日本語')).toBeInTheDocument()
  })

  test('changes language when option is selected', async () => {
    renderWithTheme(<LanguageSelector />)

    await user.click(screen.getByTestId('language-selector'))
    await user.click(screen.getByTestId('language-option-zh'))

    expect(mockPush).toHaveBeenCalledWith({ pathname: '/', query: {} }, '/', {
      locale: 'zh',
    })
  })

  test('closes dropdown when clicking outside', async () => {
    renderWithTheme(<LanguageSelector />)

    await user.click(screen.getByTestId('language-selector'))
    expect(screen.getByTestId('language-dropdown')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByTestId('language-dropdown')).not.toBeInTheDocument()
  })

  test('applies correct styles in light and dark modes', () => {
    // Test light mode
    const { rerender } = renderWithTheme(<LanguageSelector />, {
      theme: 'light',
    })
    const buttonLight = screen.getByTestId('language-selector')

    expect(buttonLight).toHaveClass('bg-white')
    expect(buttonLight).toHaveClass('text-gray-700')
    expect(buttonLight).toHaveClass('border-gray-200')

    // Test dark mode
    rerender(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <LanguageSelector />
      </ThemeProvider>
    )
    const buttonDark = screen.getByTestId('language-selector')

    expect(buttonDark).toHaveClass('dark:bg-gray-800')
    expect(buttonDark).toHaveClass('dark:text-gray-300')
    expect(buttonDark).toHaveClass('dark:border-gray-700')
  })
})
