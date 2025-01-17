import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SoftwareList from '../SoftwareList'

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (key === 'items') {
        return `${options.count} items`
      }
      return (
        {
          selected: 'Selected Software',
          available: 'Available Software',
          search: 'Search software...',
          add: 'Add New Software',
        }[key] || key
      )
    },
  }),
}))

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
        size_in_GB: 0.2,
        category: 'Development',
      },
      {
        id: 'chrome',
        name: 'Chrome',
        size_in_GB: 0.5,
        category: 'Browser',
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeEach(async () => {
    // Mock fetch response
    fetch.mockResponseOnce(
      JSON.stringify({
        categories: [
          { id: 'development', name: 'Development', order: 1 },
          { id: 'browser', name: 'Browser', order: 2 },
        ],
        system: {
          os: { size_in_GB: 15 },
          preinstalled: { size_in_GB: 5 },
        },
      })
    )

    // Mock DOM methods that JSDOM doesn't support
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

    expect(await screen.findByText('Selected Software')).toBeInTheDocument()
    expect(await screen.findByText('Available Software')).toBeInTheDocument()
    expect(await screen.findByText('0 items')).toBeInTheDocument()
  })

  // Software removal test
  test('removes software from selection', async () => {
    render(<SoftwareList {...mockProps} selectedSoftware={['vscode']} />)

    const softwareItem = (await screen.findByTitle('VS Code')).closest('.group')
    expect(softwareItem).toBeInTheDocument()

    const removeButton = await screen.findByLabelText('Remove VS Code')
    expect(removeButton).toBeInTheDocument()

    fireEvent.mouseEnter(softwareItem)
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
          category: 'Others',
          size_in_GB: 1,
          icon: '',
          description: '',
        },
      ])
      expect(mockProps.onSoftwareUpdate).toHaveBeenCalledWith(['newsoftware'])
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
      // We use the same props as before, but ensure we re-render fresh
      render(<SoftwareList {...mockProps} />)

      // Grab the draggable element and the drop zone
      // IMPORTANT: The drop zone is the ".selected-software-container" div
      const draggableItem = (await screen.findByText('Chrome')).closest('div')
      const dropZone = document.querySelector('.selected-software-container')

      const mockDataTransfer = {
        setData: jest.fn(),
        getData: jest.fn(() => 'chrome'),
        setDragImage: jest.fn(),
        effectAllowed: null,
      }

      // Wrap the drag & drop sequence in act
      await act(async () => {
        fireEvent.dragStart(draggableItem, { dataTransfer: mockDataTransfer })
        fireEvent.dragEnter(dropZone, { dataTransfer: mockDataTransfer })
        fireEvent.dragOver(dropZone, { dataTransfer: mockDataTransfer })
        fireEvent.drop(dropZone, { dataTransfer: mockDataTransfer })
      })

      // Verify "Chrome" was added to selected software
      expect(mockProps.onSoftwareUpdate).toHaveBeenCalledWith(['chrome'])
    })
    test('filters software when clicking category tabs', async () => {
      // Render the component with the default mockProps
      render(<SoftwareList {...mockProps} />)

      // Wait for categories to load and get tab buttons
      const devTab = await screen.findByRole('button', { name: 'Development' })
      const browserTab = await screen.findByRole('button', { name: 'Browser' })
      const allTab = await screen.findByRole('button', { name: 'All' })

      // "All" is active by default, so both are visible
      expect(screen.getByText('VS Code')).toBeInTheDocument()
      expect(screen.getByText('Chrome')).toBeInTheDocument()

      // Click "Browser" tab
      fireEvent.click(browserTab)
      // Only "Chrome" should show
      expect(screen.getByText('Chrome')).toBeInTheDocument()
      expect(screen.queryByText('VS Code')).not.toBeInTheDocument()

      // Click "Development" tab
      fireEvent.click(devTab)
      // Only "VS Code" should show
      expect(screen.getByText('VS Code')).toBeInTheDocument()
      expect(screen.queryByText('Chrome')).not.toBeInTheDocument()

      // Click "All" tab again
      fireEvent.click(allTab)
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
})
