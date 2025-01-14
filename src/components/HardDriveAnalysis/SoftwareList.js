import React, { useState, useEffect } from 'react'

const SoftwareList = ({ selectedSoftware, onSoftwareUpdate, searchQuery }) => {
  const [softwareData, setSoftwareData] = useState({})
  const [categories, setCategories] = useState({})
  const [draggedSoftware, setDraggedSoftware] = useState(null)
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Development')
  const [newSoftware, setNewSoftware] = useState({
    name: '',
    size: '',
    unit: 'GB',
  })

  useEffect(() => {
    fetch('/software-data.json')
      .then(response => response.json())
      .then(data => {
        setSoftwareData(data.software)

        // Initialize categories with data from JSON
        const allCategories = {
          All: Object.keys(data.software),
          ...data.categories,
          Others: [],
        }

        // Populate Others category with uncategorized software
        const categorizedSoftware = new Set(
          Object.values(data.categories).flat()
        )
        allCategories.Others = Object.keys(data.software).filter(
          software => !categorizedSoftware.has(software)
        )

        setCategories(allCategories)
      })
      .catch(error => console.error('Error loading software data:', error))
  }, [])

  // Filter available software based on local search and active category
  const availableSoftware = Object.keys(softwareData).filter(software => {
    const matchesSearch = software
      .toLowerCase()
      .includes(localSearchQuery.toLowerCase())
    const matchesCategory =
      activeCategory === 'All' || categories[activeCategory]?.includes(software)
    return (
      !selectedSoftware.includes(software) && matchesSearch && matchesCategory
    )
  })

  const handleDragStart = (e, software) => {
    setDraggedSoftware(software)
    e.dataTransfer.setData('software', software)
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
  }

  const handleRemove = softwareToRemove => {
    const newList = selectedSoftware.filter(
      software => software !== softwareToRemove
    )
    onSoftwareUpdate(newList)

    // Check if the removed software was a custom addition
    const predefinedCategories = Object.entries(categories)
      .filter(([key]) => key !== 'All' && key !== 'Others')
      .map(([_, value]) => value)
      .flat()
      .filter(s => s !== undefined)

    const isCustomSoftware = !predefinedCategories.includes(softwareToRemove)

    // If it was a custom addition, add it to Others category
    if (isCustomSoftware && !categories.Others.includes(softwareToRemove)) {
      setCategories(prev => ({
        ...prev,
        Others: [...prev.Others, softwareToRemove],
        All: [...prev.All, softwareToRemove],
      }))
    }
  }

  const handleAddSoftware = () => {
    if (!newSoftware.name || !newSoftware.size) return

    const size =
      newSoftware.unit === 'GB'
        ? Number(newSoftware.size)
        : Number(newSoftware.size) / 1024

    setSoftwareData(prev => ({
      ...prev,
      [newSoftware.name]: size,
    }))

    setCategories(prev => ({
      ...prev,
      All: [...prev.All, newSoftware.name],
      Others: [...prev.Others, newSoftware.name],
    }))

    onSoftwareUpdate([...selectedSoftware, newSoftware.name])
    setActiveCategory('All')
    setNewSoftware({ name: '', size: '', unit: 'GB' })
    setLocalSearchQuery('')
    setShowAddForm(false)
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
          <div className="p-4 space-y-2.5">
            {selectedSoftware.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-sm text-gray-500 dark:text-gray-400">
                Drag software here to add
              </div>
            ) : (
              selectedSoftware.map(software => (
                <div
                  key={software}
                  className="group flex items-center justify-between p-3 
                    bg-white dark:bg-gray-800/50 backdrop-blur-sm
                    rounded-lg border border-gray-200 dark:border-gray-700 
                    shadow-sm hover:shadow-md transition-all duration-300
                    hover:border-gray-300 dark:hover:border-gray-600"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {software}
                    </span>
                    <span
                      className="px-2.5 py-1 text-xs font-medium rounded-full 
                      bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {softwareData[software]}GB
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(software)}
                    className="p-2 rounded-full text-gray-400 hover:text-red-500 
                      hover:bg-red-50 dark:hover:bg-red-900/30 transition-all
                      opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
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
              ))
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
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
          {Object.keys(categories).map(category => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category)
                setLocalSearchQuery('')
              }}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                transition-colors
                ${
                  activeCategory === category && !localSearchQuery
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-2.5">
          {availableSoftware.length > 0 ? (
            availableSoftware.map(software => (
              <div
                key={software}
                draggable
                onDragStart={e => handleDragStart(e, software)}
                onDragEnd={handleDragEnd}
                className="flex items-center justify-between p-3 
                  bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm
                  rounded-lg border border-gray-200 dark:border-gray-700
                  cursor-move hover:bg-gray-100/50 dark:hover:bg-gray-700/50
                  transition-all duration-300 hover:shadow-sm
                  hover:border-gray-300 dark:hover:border-gray-600"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {software}
                </span>
                <span
                  className="px-2.5 py-1 text-xs font-medium rounded-full 
                  bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >
                  {softwareData[software]}GB
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
  )
}

export default SoftwareList
