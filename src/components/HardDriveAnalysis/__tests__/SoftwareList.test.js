import {
  render,
  screen,
  fireEvent,
  act,
  createEvent,
} from '@testing-library/react'
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

  beforeEach(async () => {
    jest.clearAllMocks()

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

    // Mock document methods
    const mockElement = document.createElement('div')
    document.body.appendChild(mockElement)

    // Mock drag image creation
    jest.spyOn(document, 'createElement').mockImplementation(() => {
      const el = mockElement.cloneNode(true)
      Object.defineProperty(el, 'innerHTML', {
        set: jest.fn(),
      })
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
})
