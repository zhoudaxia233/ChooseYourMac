import React, { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { formatSize } from '../../utils/sizeUtils'

const SoftwareList = ({
  selectedSoftware,
  onSoftwareUpdate,
  onSoftwareListUpdate,
  searchQuery,
  softwareList,
}) => {
  const { t } = useTranslation('common')
  const [categoryList, setCategoryList] = useState([])
  const [draggedSoftware, setDraggedSoftware] = useState(null)
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [newSoftware, setNewSoftware] = useState({
    name: '',
    size: '',
    unit: 'GB',
  })
  const [activeItemId, setActiveItemId] = useState(null)

  useEffect(() => {
    fetch('/software-data.json')
      .then(response => response.json())
      .then(data => {
        const sortedCategories = data.categories.sort(
          (a, b) => a.order - b.order
        )
        const hasAllAlready = sortedCategories.some(
          category => category.id === 'all'
        )
        setCategoryList([
          ...(hasAllAlready
            ? []
            : [{ id: 'all', name: t('categories.all'), order: 0 }]),
          ...sortedCategories.map(category => ({
            ...category,
            name: t(`categories.${category.id}`),
          })),
        ])
      })
      .catch(error => console.error('Error loading software data:', error))
  }, [t])

  // Filter available software based on search and category
  const availableSoftware = softwareList.filter(software => {
    const matchesSearch = software.name
      .toLowerCase()
      .includes(localSearchQuery.toLowerCase())
    const matchesCategory =
      activeCategory === 'All' ||
      software.category === activeCategory.toLowerCase()
    return (
      !selectedSoftware.includes(software.id) &&
      matchesSearch &&
      matchesCategory
    )
  })

  const handleDragStart = (e, software) => {
    setDraggedSoftware(software)
    e.dataTransfer.setData('software', software)

    // Set drag effect
    e.dataTransfer.effectAllowed = 'move'

    // Create custom drag image
    const dragPreview = document.createElement('div')
    const softwareDetails = softwareList.find(s => s.id === software)
    dragPreview.innerHTML = `
      <div class="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
        border border-gray-200 dark:border-gray-700">
        <span class="font-medium text-gray-900 dark:text-gray-100">
          ${softwareDetails?.name || ''}
        </span>
      </div>
    `
    document.body.appendChild(dragPreview)
    dragPreview.style.position = 'absolute'
    dragPreview.style.top = '-1000px'

    // Set the custom drag image
    e.dataTransfer.setDragImage(dragPreview, 0, 0)

    // Clean up the temporary element after drag starts
    requestAnimationFrame(() => {
      document.body.removeChild(dragPreview)
    })
  }

  const handleDragEnd = () => {
    setDraggedSoftware(null)
  }

  const handleDragOver = e => {
    e.preventDefault()
  }

  const scrollToBottom = () => {
    // 等待 DOM 更新完成
    requestAnimationFrame(() => {
      const selectedContainer = document.querySelector(
        '.selected-software-container'
      )
      if (selectedContainer) {
        // 使用 scrollTo 带有平滑滚动效果
        selectedContainer.scrollTo({
          top: selectedContainer.scrollHeight,
          behavior: 'smooth',
        })
      }
    })
  }

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    const software = e.dataTransfer.getData('software')

    if (selectedSoftware.includes(software)) {
      return
    }

    const newList = [...selectedSoftware]
    newList.splice(targetIndex, 0, software)
    onSoftwareUpdate(newList)
    scrollToBottom()
  }

  const handleRemove = softwareToRemove => {
    const newList = selectedSoftware.filter(id => id !== softwareToRemove)
    onSoftwareUpdate(newList)

    // Check if the removed software was a custom addition
    const predefinedCategories = categoryList
      .filter(category => category.name !== 'All' && category.name !== 'Others')
      .map(category => category.name)

    const removedSoftware = softwareList.find(s => s.id === softwareToRemove)
    const isCustomSoftware =
      removedSoftware &&
      !predefinedCategories.includes(removedSoftware.category)

    // If it was a custom addition, update its category to Others
    if (isCustomSoftware) {
      onSoftwareListUpdate(
        softwareList.map(software =>
          software.id === softwareToRemove
            ? { ...software, category: 'Others' }
            : software
        )
      )
    }
  }

  const handleAddSoftware = () => {
    if (!newSoftware.name || !newSoftware.size) return

    const newSoftwareItem = {
      id: newSoftware.name.toLowerCase().replace(/\s+/g, '-'),
      name: newSoftware.name,
      category: 'Others',
      size: `${newSoftware.size} ${newSoftware.unit}`,
      icon: '',
      description: '',
    }

    onSoftwareListUpdate([...softwareList, newSoftwareItem])
    onSoftwareUpdate([...selectedSoftware, newSoftwareItem.id])
    setActiveCategory('All')
    setNewSoftware({ name: '', size: '', unit: 'GB' })
    setLocalSearchQuery('')
    setShowAddForm(false)
    scrollToBottom()
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      if (!showAddForm) {
        // if there is only one result, add it to selected software
        if (availableSoftware.length === 1) {
          onSoftwareUpdate([...selectedSoftware, availableSoftware[0].id])
          setLocalSearchQuery('')
          scrollToBottom()
          return
        }

        // if there is no matching result, show add form
        if (availableSoftware.length === 0) {
          setShowAddForm(true)
          setNewSoftware({ ...newSoftware, name: localSearchQuery })
        }
      } else {
        // trigger add function in form mode
        handleAddSoftware()
      }
    }
  }

  const handleSearchChange = e => {
    setLocalSearchQuery(e.target.value)
    if (e.target.value) {
      setActiveCategory('All') // Switch to All category when searching
    }
  }

  // helper function to get software details
  const getSoftwareDetails = softwareId => {
    return softwareList.find(s => s.id === softwareId)
  }

  const handleAdd = softwareId => {
    onSoftwareUpdate([...selectedSoftware, softwareId])
    scrollToBottom()
  }

  // Add touch event handler and click outside handler
  const handleItemTouch = (softwareId, e) => {
    // Prevent this from affecting desktop behavior
    if (window.matchMedia('(min-width: 1024px)').matches) {
      return
    }
    e.preventDefault()
    setActiveItemId(activeItemId === softwareId ? null : softwareId)
  }

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = e => {
      // Only handle on mobile
      if (window.matchMedia('(min-width: 1024px)').matches) {
        return
      }
      // If clicked outside of any software item
      if (!e.target.closest('.software-item')) {
        setActiveItemId(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="space-y-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-4">
      {/* Selected Software Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-base text-gray-900 dark:text-gray-100">
            {t('selected')}
          </h3>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('items', { count: selectedSoftware.length })}
          </span>
        </div>

        <div
          className={`
            selected-software-container
            min-h-[100px] max-h-[150px] overflow-y-auto custom-scrollbar
            border-2 rounded-xl transition-colors duration-200
            ${
              draggedSoftware
                ? 'border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/20'
                : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20'
            }
          `}
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, selectedSoftware.length)}
          onDragEnter={e => e.preventDefault()}
        >
          <div className="p-4">
            {selectedSoftware.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-sm text-gray-500 dark:text-gray-400">
                Drag software here to add
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                {selectedSoftware.map(softwareId => {
                  const software = getSoftwareDetails(softwareId)
                  return software ? (
                    <div
                      key={software.id}
                      onTouchStart={e => handleItemTouch(software.id, e)}
                      className={`software-item group relative bg-white dark:bg-gray-800/50 
                        backdrop-blur-sm rounded-lg border border-gray-200 
                        dark:border-gray-700 shadow-sm hover:shadow-md 
                        transition-all duration-300 hover:border-gray-300 
                        dark:hover:border-gray-600 p-2
                        ${activeItemId === software.id ? 'touch-active' : ''}`}
                    >
                      {/* Size Badge */}
                      <div
                        className={`absolute top-2 right-2 px-2 py-0.5 text-xs 
                          font-medium rounded-full bg-gray-100 text-gray-600 
                          dark:bg-gray-800 dark:text-gray-400
                          lg:opacity-0 lg:group-hover:opacity-100 transition-opacity
                          ${
                            activeItemId === software.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          }`}
                      >
                        {software.size}
                      </div>

                      {/* Remove Button */}
                      <button
                        className={`absolute top-1.5 left-1.5 
                          w-6 h-6 rounded-full 
                          text-gray-400 hover:text-red-500
                          bg-transparent hover:bg-red-50
                          dark:hover:bg-red-900/30 
                          transition-all
                          lg:opacity-0 lg:group-hover:opacity-100
                          flex items-center justify-center
                          cursor-pointer z-10
                          ${
                            activeItemId === software.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          }`}
                        aria-label={`Remove ${software.name}`}
                        onClick={() => handleRemove(software.id)}
                      >
                        <svg
                          className="w-3.5 h-3.5 pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>

                      {/* Software Name */}
                      <div className="px-2">
                        <h4
                          className={`font-medium text-sm text-gray-900 dark:text-gray-100 
                            truncate lg:group-hover:opacity-0 transition-opacity
                            ${
                              activeItemId === software.id
                                ? 'opacity-0'
                                : 'opacity-100'
                            }`}
                          title={software.name}
                        >
                          {software.name}
                        </h4>
                      </div>
                    </div>
                  ) : null
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Software Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-base text-gray-900 dark:text-gray-100">
            {t('available')}
          </h3>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('search')}
            value={localSearchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 
              dark:border-gray-700 bg-white dark:bg-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-500
              text-gray-900 dark:text-gray-100"
            data-testid="search-input"
          />
          {localSearchQuery && (
            <button
              onClick={() => {
                setLocalSearchQuery('')
                setActiveCategory('All')
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5
                text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-700/50
                rounded-full transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
          {categoryList.map(category => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.name)
                setLocalSearchQuery('')
              }}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                transition-colors
                ${
                  activeCategory === category.name && !localSearchQuery
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="min-h-[100px] max-h-[300px] overflow-y-auto custom-scrollbar">
          <div className="grid gap-2.5 p-4">
            {availableSoftware.length > 0 ? (
              availableSoftware.map(software => (
                <div
                  key={software.id}
                  draggable
                  onDragStart={e => handleDragStart(e, software.id)}
                  className="flex items-center justify-between p-3 
                    bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm
                    rounded-lg border border-gray-200 dark:border-gray-700
                    cursor-move hover:bg-gray-100/50 dark:hover:bg-gray-700/50
                    transition-all duration-300 hover:shadow-sm
                    hover:border-gray-300 dark:hover:border-gray-600"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {software.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 text-xs font-medium rounded-full 
                      bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {software.size}
                    </span>
                    <button
                      onClick={e => {
                        e.preventDefault() // Prevent drag start
                        handleAdd(software.id)
                      }}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700
                        text-gray-500 hover:text-gray-700 dark:text-gray-400 
                        dark:hover:text-gray-200 transition-colors"
                      data-testid={`add-software-${software.id}`}
                      aria-label={`Add ${software.name}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : showAddForm ? (
              <div
                className="space-y-4 p-4 border-2 border-dashed border-gray-200 
                dark:border-gray-700 rounded-xl"
              >
                <input
                  type="text"
                  placeholder="Software name"
                  value={newSoftware.name}
                  onChange={e =>
                    setNewSoftware({ ...newSoftware, name: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 
                    dark:border-gray-700 bg-white dark:bg-gray-800
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-500 dark:placeholder-gray-400"
                  data-testid="software-name-input"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Size"
                    value={newSoftware.size}
                    onChange={e => {
                      const value = e.target.value
                      setNewSoftware({
                        ...newSoftware,
                        size: value === '' ? '' : Math.max(0, Number(value)),
                      })
                    }}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 
                      dark:border-gray-700 bg-white dark:bg-gray-800
                      text-gray-900 dark:text-gray-100
                      placeholder-gray-500 dark:placeholder-gray-400"
                    data-testid="software-size-input"
                  />
                  <select
                    value={newSoftware.unit}
                    onChange={e =>
                      setNewSoftware({ ...newSoftware, unit: e.target.value })
                    }
                    className="px-3 py-2 rounded-lg border border-gray-200 
                      dark:border-gray-700 bg-white dark:bg-gray-800
                      text-gray-900 dark:text-gray-100"
                    data-testid="software-size-unit-select"
                  >
                    <option
                      value="GB"
                      className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                    >
                      GB
                    </option>
                    <option
                      value="MB"
                      className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                    >
                      MB
                    </option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSoftware}
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 
                      text-white rounded-lg transition-colors"
                  >
                    {t('add')}
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 
                      dark:bg-gray-800 dark:hover:bg-gray-700
                      text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="space-y-4 p-4 border-2 border-dashed border-gray-200 
                dark:border-gray-700 rounded-xl"
              >
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  No matching software found
                </p>
                <button
                  onClick={() => {
                    setShowAddForm(true)
                    setNewSoftware({ ...newSoftware, name: localSearchQuery })
                  }}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 
                    text-white rounded-lg transition-colors"
                >
                  {t('add')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SoftwareList
