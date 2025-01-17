import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('LanguageSelector Component', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    mockPush.mockClear()
  })

  test('renders language selector button', () => {
    render(<LanguageSelector />)
    expect(screen.getByTestId('language-selector')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  test('shows dropdown when clicked', async () => {
    render(<LanguageSelector />)

    await user.click(screen.getByTestId('language-selector'))

    expect(screen.getByTestId('language-dropdown')).toBeInTheDocument()
    expect(screen.getAllByText('English')).toHaveLength(2)
    expect(screen.getByText('中文')).toBeInTheDocument()
    expect(screen.getByText('日本語')).toBeInTheDocument()
  })

  test('changes language when option is selected', async () => {
    render(<LanguageSelector />)

    await user.click(screen.getByTestId('language-selector'))
    await user.click(screen.getByTestId('language-option-zh'))

    expect(mockPush).toHaveBeenCalledWith({ pathname: '/', query: {} }, '/', {
      locale: 'zh',
    })
  })

  test('closes dropdown when clicking outside', async () => {
    render(<LanguageSelector />)

    await user.click(screen.getByTestId('language-selector'))
    expect(screen.getByTestId('language-dropdown')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByTestId('language-dropdown')).not.toBeInTheDocument()
  })
})
