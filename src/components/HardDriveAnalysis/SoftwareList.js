import React, { useState, useEffect } from 'react'

const SoftwareList = ({ selectedSoftware, onSoftwareUpdate, searchQuery }) => {
  const [softwareData, setSoftwareData] = useState({})
  const [draggedSoftware, setDraggedSoftware] = useState(null)

  useEffect(() => {
    fetch('/software-data.json')
      .then(response => response.json())
      .then(data => setSoftwareData(data))
      .catch(error => console.error('Error loading software data:', error))
  }, [])

  // List of all available software
  const availableSoftware = Object.keys(softwareData).filter(
    software =>
      !selectedSoftware.includes(software) &&
      software.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDragStart = (e, software) => {
    setDraggedSoftware(software)
    e.dataTransfer.setData('software', software)

    // 创建自定义拖拽图像
    const dragImage = document.createElement('div')
    dragImage.className =
      'px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700'
    dragImage.innerHTML = software
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    document.body.appendChild(dragImage)

    e.dataTransfer.setDragImage(dragImage, 0, 0)

    // 清理函数
    setTimeout(() => {
      document.body.removeChild(dragImage)
    }, 0)
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

    // Prevent duplicates
    if (selectedSoftware.includes(software)) {
      return
    }

    // Add new software to the list
    const newList = [...selectedSoftware]
    newList.splice(targetIndex, 0, software)
    onSoftwareUpdate(newList)
  }

  const handleRemove = softwareToRemove => {
    const newList = selectedSoftware.filter(
      software => software !== softwareToRemove
    )
    onSoftwareUpdate(newList)
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
            min-h-[100px] grid gap-2.5 p-4 border-2 
            ${
              draggedSoftware
                ? 'border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/20'
                : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20'
            }
            rounded-xl transition-colors duration-200
          `}
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, selectedSoftware.length)}
          onDragEnter={e => e.preventDefault()}
        >
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
                    bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400
                    group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors"
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

      {/* Available Software Section */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-base text-gray-900 dark:text-gray-100">
            Available Software
          </h3>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Drag to add
          </span>
        </div>

        <div className="grid gap-2.5">
          {availableSoftware.map(software => (
            <div
              key={software}
              draggable
              onDragStart={e => handleDragStart(e, software)}
              onDragEnd={handleDragEnd}
              className={`
                flex items-center justify-between p-3 
                bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm
                rounded-lg border border-gray-200 dark:border-gray-700
                cursor-move hover:bg-gray-100/50 dark:hover:bg-gray-700/50
                transition-all duration-300 hover:shadow-sm
                hover:border-gray-300 dark:hover:border-gray-600
                ${draggedSoftware === software ? 'opacity-50' : ''}
              `}
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
          ))}
        </div>
      </div>
    </div>
  )
}

export default SoftwareList
