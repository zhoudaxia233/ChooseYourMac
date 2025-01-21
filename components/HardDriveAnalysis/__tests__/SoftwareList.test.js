import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SoftwareList from '../SoftwareList'

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      // Keep existing translations
      if (key === 'items') {
        return `${options.count} items`
      }

      // Add new category translations
      const translations = {
        selected: 'Selected Software',
        available: 'Available Software',
        search: 'Search software...',
        add: 'Add New Software',
        'categories.all': 'All',
        'categories.development': 'Development',
        'categories.design': 'Design',
        'categories.video-audio': 'Video & Audio',
        'categories.utilities': 'Utilities',
        'categories.game': 'Game',
        'categories.others': 'Others',
      }
      return translations[key] || key
    },
  }),
}))

// Mock matchMedia
beforeAll(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: false, // Mock desktop environment for tests
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
})

// Clean up after tests
afterAll(() => {
  delete window.matchMedia
})

describe('SoftwareList Component', () => {
  const mockProps = {
    selectedSoftware: [],
    onSoftwareUpdate: jest.fn(),
    onSoftwareListUpdate: jest.fn(),
    searchQuery: '',
    softwareList: [
      {
        id: 'vscode',
        name: 'VS Code',
        size: '350 MB',
        category: 'development',
      },
      {
        id: 'chrome',
        name: 'Chrome',
        size: '300 MB',
        category: 'utilities',
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeEach(async () => {
    // Mock fetch response with valid categories data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            categories: [
              { id: 'development', order: 1 },
              { id: 'utilities', order: 4 },
            ],
            system: {
              os: { size_in_GB: 15 },
              preinstalled: { size_in_GB: 5 },
            },
          }),
      })
    )

    // Mock DOM methods for testing
    Object.defineProperties(Element.prototype, {
      scrollTo: {
        value: jest.fn(),
        writable: true,
      },
      scrollHeight: {
        value: 100,
        writable: true,
      },
      scrollTop: {
        value: 0,
        writable: true,
      },
    })

    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb())

    // Create mock element without recursion
    const mockElement = document.createElement('div')
    document.body.appendChild(mockElement)

    // Mock drag image creation without recursion
    const originalCreateElement = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation(tagName => {
      const el = originalCreateElement(tagName)
      if (tagName === 'div') {
        Object.defineProperty(el, 'innerHTML', { set: jest.fn() })
      }
      return el
    })
  })

  afterEach(() => {
    window.requestAnimationFrame.mockRestore()
    document.createElement.mockRestore()
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild)
    }
    jest.restoreAllMocks()
  })

  // Basic rendering test
  test('renders basic elements', async () => {
    render(<SoftwareList {...mockProps} />)

    // Wait for any one of these elements to appear
    await screen.findByText('Selected Software')

    // Then check for the others
    expect(screen.getByText('Available Software')).toBeInTheDocument()
    expect(screen.getByText('0 items')).toBeInTheDocument()
  })

  // Software removal test
  test('removes software from selection', async () => {
    render(<SoftwareList {...mockProps} selectedSoftware={['vscode']} />)

    // Wait for the element to be available
    const softwareItem = await screen.findByTitle('VS Code')
    const removeButton = screen.getByLabelText('Remove VS Code')

    fireEvent.mouseEnter(softwareItem.closest('.group'))
    fireEvent.click(removeButton)

    expect(mockProps.onSoftwareUpdate).toHaveBeenCalledWith([])
  })

  // Empty state test
  test('shows empty state message', async () => {
    render(<SoftwareList {...mockProps} softwareList={[]} />)
    expect(
      await screen.findByText('No matching software found')
    ).toBeInTheDocument()
    expect(await screen.findByText('Add New Software')).toBeInTheDocument()
  })

  // Duplicate prevention test
  test('prevents duplicate software selection', async () => {
    render(<SoftwareList {...mockProps} selectedSoftware={['vscode']} />)

    const draggableItem = (await screen.findByText('VS Code')).closest('div')
    const dropZone = (await screen.findByText('Selected Software'))
      .parentElement

    const mockDataTransfer = {
      setData: jest.fn(),
      getData: jest.fn(() => 'vscode'),
      setDragImage: jest.fn(),
      effectAllowed: null,
    }

    fireEvent.dragStart(draggableItem, { dataTransfer: mockDataTransfer })
    fireEvent.dragOver(dropZone, { dataTransfer: mockDataTransfer })
    fireEvent.drop(dropZone, { dataTransfer: mockDataTransfer })

    expect(mockProps.onSoftwareUpdate).not.toHaveBeenCalled()
  })

  // Search functionality test
  test('filters software based on search and clears search correctly', async () => {
    const user = userEvent.setup()

    // Render with mock data
    render(<SoftwareList {...mockProps} />)

    // Verify all software is initially visible
    expect(await screen.findByText('VS Code')).toBeInTheDocument()
    expect(screen.getByText('Chrome')).toBeInTheDocument()

    // Get search input
    const searchInput = screen.getByPlaceholderText('Search software...')

    // Search for 'VS'
    await user.type(searchInput, 'VS')

    // Verify only VS Code is visible and Chrome is not
    expect(await screen.findByText('VS Code')).toBeInTheDocument()
    expect(
      screen.queryByText('Chrome', { selector: 'div[draggable="true"] span' })
    ).not.toBeInTheDocument()

    // Clear search using the clear button
    const clearButton = searchInput.parentElement.querySelector('button')
    await user.click(clearButton)

    // Verify all software is visible again
    expect(await screen.findByText('VS Code')).toBeInTheDocument()
    expect(screen.getByText('Chrome')).toBeInTheDocument()
  })

  describe('Enter key functionality', () => {
    test('adds single search result to selection when Enter is pressed', async () => {
      const user = userEvent.setup()
      render(<SoftwareList {...mockProps} />)
      const searchInput = screen.getByTestId('search-input')
      // Type 'VS' to get single result
      await user.type(searchInput, 'VS')
      await user.keyboard('{Enter}')
      // Check if VS Code was added to selection
      expect(mockProps.onSoftwareUpdate).toHaveBeenCalledWith(['vscode'])
      expect(searchInput).toHaveValue('') // Search should be cleared
    })
    test('shows add form when Enter is pressed with no results', async () => {
      const user = userEvent.setup()
      render(<SoftwareList {...mockProps} />)
      const searchInput = screen.getByPlaceholderText('Search software...')
      await user.type(searchInput, 'NonExistentSoftware')
      await user.keyboard('{Enter}')
      await waitFor(() => {
        expect(screen.getByTestId('software-name-input')).toBeInTheDocument()
      })
    })
    test('submits new software when Enter is pressed in add form', async () => {
      const user = userEvent.setup()
      render(<SoftwareList {...mockProps} />)
      // First show the add form by searching non-existent software
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'NewSoftware')
      await user.keyboard('{Enter}')
      // Fill out the form
      const nameInput = await screen.findByTestId('software-name-input')
      const sizeInput = await screen.findByTestId('software-size-input')
      await user.clear(nameInput)
      await user.type(nameInput, 'NewSoftware')
      await user.type(sizeInput, '1')
      await user.keyboard('{Enter}')
      // Check if software was added
      expect(mockProps.onSoftwareListUpdate).toHaveBeenCalledWith([
        ...mockProps.softwareList,
        {
          id: 'newsoftware',
          name: 'NewSoftware',
          size: '1 GB',
          category: 'Others',
          icon: '',
          description: '',
        },
      ])
    })
    test('does not submit form when Enter is pressed with empty fields', async () => {
      const user = userEvent.setup()
      render(<SoftwareList {...mockProps} />)
      // Show the add form
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'NewSoftware')
      await user.keyboard('{Enter}')
      // Try to submit with empty size
      const nameInput = await screen.findByTestId('software-name-input')
      await user.clear(nameInput)
      await user.type(nameInput, 'NewSoftware')
      await user.keyboard('{Enter}')
      expect(mockProps.onSoftwareListUpdate).not.toHaveBeenCalled()
      expect(mockProps.onSoftwareUpdate).not.toHaveBeenCalled()
    })
    test('adds software to selection via drag and drop', async () => {
      // Render and wait for initial data loading
      render(<SoftwareList {...mockProps} />)

      // Wait for categories to load
      await screen.findByRole('button', { name: 'All' })

      // Wait for Chrome to be in the document before proceeding
      const draggableItem = await screen.findByText('Chrome')
      const dropZone = document.querySelector('.selected-software-container')
      const mockDataTransfer = {
        setData: jest.fn(),
        getData: jest.fn(() => 'chrome'),
        setDragImage: jest.fn(),
        effectAllowed: null,
      }
      // Perform drag and drop
      fireEvent.dragStart(draggableItem, { dataTransfer: mockDataTransfer })
      fireEvent.dragOver(dropZone, { dataTransfer: mockDataTransfer })
      fireEvent.drop(dropZone, { dataTransfer: mockDataTransfer })
      // Verify "Chrome" was added
      await waitFor(() => {
        expect(mockProps.onSoftwareUpdate).toHaveBeenCalledWith(['chrome'])
      })
    })
    test('filters software when clicking category tabs', async () => {
      const user = userEvent.setup()
      render(<SoftwareList {...mockProps} />)
      // Wait for categories to load
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Development' })
        ).toBeInTheDocument()
      })
      const devTab = screen.getByRole('button', { name: 'Development' })
      const utilitiesTab = screen.getByRole('button', { name: 'Utilities' })
      const allTab = screen.getByRole('button', { name: 'All' })
      // "All" is active by default, so both are visible
      expect(screen.getByText('VS Code')).toBeInTheDocument()
      expect(screen.getByText('Chrome')).toBeInTheDocument()
      // Click "Utilities" tab
      await user.click(utilitiesTab)
      // Only "Chrome" should show
      expect(screen.getByText('Chrome')).toBeInTheDocument()
      expect(screen.queryByText('VS Code')).not.toBeInTheDocument()
      // Click "Development" tab
      await user.click(devTab)
      // Only "VS Code" should show
      expect(screen.getByText('VS Code')).toBeInTheDocument()
      expect(screen.queryByText('Chrome')).not.toBeInTheDocument()
      // Click "All" tab again
      await user.click(allTab)
      // Both should be visible again
      expect(screen.getByText('VS Code')).toBeInTheDocument()
      expect(screen.getByText('Chrome')).toBeInTheDocument()
    })
  })
  test('adds software to selection when clicking the plus button', async () => {
    const user = userEvent.setup()
    render(<SoftwareList {...mockProps} />)
    // Find the add button for Chrome
    const addButton = await screen.findByTestId('add-software-chrome')
    expect(addButton).toBeInTheDocument()
    // Click the add button
    await user.click(addButton)
    // Verify the software was added
    expect(mockProps.onSoftwareUpdate).toHaveBeenCalledWith(['chrome'])
    // Verify scrollToBottom was triggered
    expect(window.requestAnimationFrame).toHaveBeenCalled()
  })

  // Add new test for mobile behavior
  describe('Mobile Touch Behavior', () => {
    beforeEach(() => {
      // Mock mobile environment for specific tests
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query.includes('min-width: 1024px') ? false : true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))
    })

    afterEach(() => {
      window.matchMedia.mockRestore()
    })

    test('toggles item visibility on touch in mobile view', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <SoftwareList {...mockProps} selectedSoftware={['vscode']} />
      )

      // Find the software item container and its elements
      const softwareItem = screen
        .getByTitle('VS Code')
        .closest('.software-item')
      const sizeBadgeContainer = screen.getByText('350 MB').closest('.absolute')
      const removeButton = screen.getByLabelText('Remove VS Code')
      const softwareName = screen.getByTitle('VS Code')

      // Verify initial state
      expect(sizeBadgeContainer).toHaveClass('opacity-0', { exact: false })
      expect(removeButton).toHaveClass('opacity-0', { exact: false })
      expect(softwareName).toHaveClass('opacity-100', { exact: false })

      // Trigger touch event
      fireEvent.touchStart(softwareItem)

      // Wait for state update and check visibility
      await waitFor(() => {
        expect(container.querySelector('.software-item')).toHaveClass(
          'touch-active'
        )
        expect(sizeBadgeContainer).toHaveClass('opacity-100', { exact: false })
        expect(removeButton).toHaveClass('opacity-100', { exact: false })
        expect(softwareName).toHaveClass('opacity-0', { exact: false })
      })

      // Trigger touch event again
      fireEvent.touchStart(softwareItem)

      // Wait for state update and check visibility
      await waitFor(() => {
        expect(container.querySelector('.software-item')).not.toHaveClass(
          'touch-active'
        )
        expect(sizeBadgeContainer).toHaveClass('opacity-0', { exact: false })
        expect(removeButton).toHaveClass('opacity-0', { exact: false })
        expect(softwareName).toHaveClass('opacity-100', { exact: false })
      })
    })
  })
})
