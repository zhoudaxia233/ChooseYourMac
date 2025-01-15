import React, { useState, useEffect } from 'react'

const SoftwareList = ({ selectedSoftware, onSoftwareUpdate, searchQuery }) => {
  const [softwareList, setSoftwareList] = useState([])
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

  useEffect(() => {
    fetch('/software-data.json')
      .then(response => response.json())
      .then(data => {
        setSoftwareList(data.software)
        setCategoryList([
          { id: 'all', name: 'All', order: 0 },
          ...data.categories.sort((a, b) => a.order - b.order),
        ])
      })
      .catch(error => console.error('Error loading software data:', error))
  }, [])

  // Filter available software based on search and category
  const availableSoftware = softwareList.filter(software => {
    const matchesSearch = software.name
      .toLowerCase()
      .includes(localSearchQuery.toLowerCase())
    const matchesCategory =
      activeCategory === 'All' || software.category === activeCategory
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

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    const software = e.dataTransfer.getData('software')

    if (selectedSoftware.includes(software)) {
      return
    }

    const newList = [...selectedSoftware]
    newList.splice(targetIndex, 0, software)
    onSoftwareUpdate(newList)

    // Scroll to bottom after drop
    setTimeout(() => {
      const selectedContainer = document.querySelector(
        '.selected-software-container'
      )
      if (selectedContainer) {
        selectedContainer.scrollTop = selectedContainer.scrollHeight
      }
    }, 0)
  }

  const handleRemove = softwareToRemove => {
    const newList = selectedSoftware.filter(
      software => software !== softwareToRemove
    )
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
      setSoftwareList(prev =>
        prev.map(software =>
          software.id === softwareToRemove
            ? { ...software, category: 'Others' }
            : software
        )
      )
    }
  }

  const handleAddSoftware = () => {
    if (!newSoftware.name || !newSoftware.size) return

    const size =
      newSoftware.unit === 'GB'
        ? Number(newSoftware.size)
        : Number(newSoftware.size) / 1024

    const newSoftwareItem = {
      id: newSoftware.name.toLowerCase().replace(/\s+/g, '-'),
      name: newSoftware.name,
      category: 'Others',
      size_in_GB: size,
      icon: '',
      description: '',
    }

    setSoftwareList(prev => [...prev, newSoftwareItem])
    onSoftwareUpdate([...selectedSoftware, newSoftwareItem.id])
    setActiveCategory('All')
    setNewSoftware({ name: '', size: '', unit: 'GB' })
    setLocalSearchQuery('')
    setShowAddForm(false)

    // Scroll to bottom after adding new software
    setTimeout(() => {
      const selectedContainer = document.querySelector(
        '.selected-software-container'
      )
      if (selectedContainer) {
        selectedContainer.scrollTop = selectedContainer.scrollHeight
      }
    }, 0)
  }

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      if (!showAddForm) {
        // Press Enter in search mode, if no matching results, show add form
        if (availableSoftware.length === 0) {
          setShowAddForm(true)
          setNewSoftware({ ...newSoftware, name: localSearchQuery })
        }
      } else {
        // Press Enter in add form mode, trigger add function
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

  // 获取软件详情的辅助函数
  const getSoftwareDetails = softwareId => {
    return softwareList.find(s => s.id === softwareId)
  }

  return (
    <div className="space-y-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-4">
      {/* Selected Software Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-base text-gray-900 dark:text-gray-100">
            Selected Software
          </h3>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {selectedSoftware.length} items
          </span>
        </div>

        <div
          className={`
            selected-software-container
            min-h-[100px] max-h-[300px] overflow-y-auto custom-scrollbar
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
              <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
                {selectedSoftware.map(softwareId => {
                  const software = getSoftwareDetails(softwareId)
                  return software ? (
                    <div
                      key={software.id}
                      className="group relative bg-white dark:bg-gray-800/50 
                        backdrop-blur-sm rounded-xl border border-gray-200 
                        dark:border-gray-700 shadow-sm hover:shadow-md 
                        transition-all duration-300 hover:border-gray-300 
                        dark:hover:border-gray-600 p-4"
                    >
                      {/* Size Badge */}
                      <div
                        className="absolute top-3 right-3 px-2.5 py-1 text-xs 
                          font-medium rounded-full bg-gray-100 text-gray-600 
                          dark:bg-gray-800 dark:text-gray-400"
                      >
                        {software.size_in_GB}GB
                      </div>

                      {/* Software Name */}
                      <div className="pr-16">
                        {' '}
                        {/* Add right padding to avoid overlap with size badge */}
                        <h4
                          className="font-medium text-gray-900 dark:text-gray-100 
                            truncate group-hover:whitespace-normal group-hover:text-clip"
                          title={software.name}
                        >
                          {software.name}
                        </h4>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(software.id)}
                        className="absolute bottom-3 right-3 p-2 rounded-full 
                          text-gray-400 hover:text-red-500 hover:bg-red-50 
                          dark:hover:bg-red-900/30 transition-all opacity-0 
                          group-hover:opacity-100 scale-90 group-hover:scale-100"
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
            Available Software
          </h3>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search software..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 
              dark:border-gray-700 bg-white dark:bg-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-500
              text-gray-900 dark:text-gray-100"
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
                  <span
                    className="px-2.5 py-1 text-xs font-medium rounded-full 
                    bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  >
                    {software.size_in_GB}GB
                  </span>
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
                  value={newSoftware.name || localSearchQuery}
                  onChange={e =>
                    setNewSoftware({ ...newSoftware, name: e.target.value })
                  }
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 
                    dark:border-gray-700 bg-white dark:bg-gray-800
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-500 dark:placeholder-gray-400"
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
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 
                      dark:border-gray-700 bg-white dark:bg-gray-800
                      text-gray-900 dark:text-gray-100
                      placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <select
                    value={newSoftware.unit}
                    onChange={e =>
                      setNewSoftware({ ...newSoftware, unit: e.target.value })
                    }
                    className="px-3 py-2 rounded-lg border border-gray-200 
                      dark:border-gray-700 bg-white dark:bg-gray-800
                      text-gray-900 dark:text-gray-100"
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
                    Add to Selection
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
                  Add New Software
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
