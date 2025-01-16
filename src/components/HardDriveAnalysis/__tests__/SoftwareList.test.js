import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SoftwareList from '../SoftwareList'

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
        categories: ['Development', 'Browser'],
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
    await act(async () => {
      render(<SoftwareList {...mockProps} />)
      await Promise.resolve()
    })

    expect(screen.getByText('Selected Software')).toBeInTheDocument()
    expect(screen.getByText('Available Software')).toBeInTheDocument()
    expect(screen.getByText('0 items')).toBeInTheDocument()
  })

  // Software removal test
  test('removes software from selection', async () => {
    await act(async () => {
      render(<SoftwareList {...mockProps} selectedSoftware={['vscode']} />)
    })

    const softwareItem = screen.getByTitle('VS Code').closest('.group')
    expect(softwareItem).toBeInTheDocument()

    const removeButton = screen.getByLabelText('Remove VS Code')
    expect(removeButton).toBeInTheDocument()

    await act(async () => {
      fireEvent.mouseEnter(softwareItem)
      await Promise.resolve()
      fireEvent.click(removeButton)
    })

    expect(mockProps.onSoftwareUpdate).toHaveBeenCalledWith([])
  })

  // Empty state test
  test('shows empty state message', async () => {
    await act(async () => {
      render(<SoftwareList {...mockProps} softwareList={[]} />)
    })
    expect(screen.getByText('No matching software found')).toBeInTheDocument()
    expect(screen.getByText('Add New Software')).toBeInTheDocument()
  })

  // Duplicate prevention test
  test('prevents duplicate software selection', async () => {
    await act(async () => {
      render(<SoftwareList {...mockProps} selectedSoftware={['vscode']} />)
    })

    const draggableItem = screen.getByText('VS Code').closest('div')
    const dropZone = screen.getByText('Selected Software').parentElement

    const mockDataTransfer = {
      setData: jest.fn(),
      getData: jest.fn(() => 'vscode'),
      setDragImage: jest.fn(),
      effectAllowed: null,
    }

    await act(async () => {
      fireEvent.dragStart(draggableItem, { dataTransfer: mockDataTransfer })
      await Promise.resolve()
      fireEvent.dragOver(dropZone, { dataTransfer: mockDataTransfer })
      await Promise.resolve()
      fireEvent.drop(dropZone, { dataTransfer: mockDataTransfer })
    })

    expect(mockProps.onSoftwareUpdate).not.toHaveBeenCalled()
  })

  // Search functionality test
  test('filters software based on search and clears search correctly', async () => {
    const user = userEvent.setup()

    // Render with mock data
    await act(async () => {
      render(<SoftwareList {...mockProps} />)
    })

    // Verify all software is initially visible
    expect(screen.getByText('VS Code')).toBeInTheDocument()
    expect(screen.getByText('Chrome')).toBeInTheDocument()

    // Get search input
    const searchInput = screen.getByPlaceholderText('Search software...')

    // Search for 'VS'
    await act(async () => {
      await user.type(searchInput, 'VS')
    })

    // Wait for the filtering to take effect
    await act(async () => {
      await Promise.resolve()
    })

    // Verify only VS Code is visible and Chrome is not
    expect(screen.getByText('VS Code')).toBeInTheDocument()
    expect(
      screen.queryByText('Chrome', { selector: 'div[draggable="true"] span' })
    ).not.toBeInTheDocument()

    // Clear search using the clear button
    const clearButton = searchInput.parentElement.querySelector('button')
    await act(async () => {
      await user.click(clearButton)
    })

    // Wait for the filtering to reset
    await act(async () => {
      await Promise.resolve()
    })

    // Verify all software is visible again
    expect(screen.getByText('VS Code')).toBeInTheDocument()
    expect(screen.getByText('Chrome')).toBeInTheDocument()
  })

  describe('Enter key functionality', () => {
    test('adds single search result to selection when Enter is pressed', async () => {
      const user = userEvent.setup()

      await act(async () => {
        render(<SoftwareList {...mockProps} />)
      })

      const searchInput = screen.getByTestId('search-input')

      // Type 'VS' to get single result
      await act(async () => {
        await user.type(searchInput, 'VS')
        await user.keyboard('{Enter}')
      })

      // Check if VS Code was added to selection
      expect(mockProps.onSoftwareUpdate).toHaveBeenCalledWith(['vscode'])
      expect(searchInput).toHaveValue('') // Search should be cleared
    })

    test('shows add form when Enter is pressed with no results', async () => {
      const user = userEvent.setup()
      render(<SoftwareList {...mockProps} />)
      const searchInput = screen.getByPlaceholderText('Search software...')

      await act(async () => {
        await user.type(searchInput, 'NonExistentSoftware')
        await user.keyboard('{Enter}')
      })

      await waitFor(() => {
        expect(screen.getByTestId('software-name-input')).toBeInTheDocument()
      })
    })

    test('submits new software when Enter is pressed in add form', async () => {
      const user = userEvent.setup()

      await act(async () => {
        render(<SoftwareList {...mockProps} />)
      })

      // First show the add form by searching non-existent software
      const searchInput = screen.getByTestId('search-input')
      await act(async () => {
        await user.type(searchInput, 'NewSoftware')
        await user.keyboard('{Enter}')
      })

      // Wait for the form to appear
      await act(async () => {
        await Promise.resolve()
      })

      // Fill out the form
      const nameInput = await screen.findByTestId('software-name-input')
      const sizeInput = await screen.findByTestId('software-size-input')

      await act(async () => {
        await user.clear(nameInput)
        await user.type(nameInput, 'NewSoftware')
        await user.type(sizeInput, '1')
        await user.keyboard('{Enter}')
      })

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

      await act(async () => {
        render(<SoftwareList {...mockProps} />)
      })

      // Show the add form
      const searchInput = screen.getByTestId('search-input')
      await act(async () => {
        await user.type(searchInput, 'NewSoftware')
        await user.keyboard('{Enter}')
      })

      // Wait for the form to appear
      await act(async () => {
        await Promise.resolve()
      })

      // Try to submit with empty size
      const nameInput = await screen.findByTestId('software-name-input')
      await act(async () => {
        await user.clear(nameInput)
        await user.type(nameInput, 'NewSoftware')
        await user.keyboard('{Enter}')
      })

      expect(mockProps.onSoftwareListUpdate).not.toHaveBeenCalled()
      expect(mockProps.onSoftwareUpdate).not.toHaveBeenCalled()
    })
  })
})
