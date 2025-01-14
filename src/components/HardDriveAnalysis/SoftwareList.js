import React, { useState, useEffect } from 'react'

const SoftwareList = ({ selectedSoftware, onSoftwareUpdate, searchQuery }) => {
  const [softwareData, setSoftwareData] = useState({})

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
    e.dataTransfer.setData('software', software)
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
    <div className="space-y-4">
      {/* Selected Software List */}
      <div
        className="space-y-2 min-h-[100px] p-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg"
        onDragOver={handleDragOver}
        onDrop={e => handleDrop(e, selectedSoftware.length)}
      >
        <h3 className="font-medium text-sm text-gray-500">Selected Software</h3>
        {selectedSoftware.map((software, index) => (
          <div
            key={software}
            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRemove(software)}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                ×
              </button>
              <span>{software}</span>
            </div>
            <span className="text-sm text-gray-500">
              {softwareData[software]}GB
            </span>
          </div>
        ))}
        {selectedSoftware.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-4">
            Drag software here
          </div>
        )}
      </div>

      {/* Available Software List */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-gray-500">
          Available Software
        </h3>
        {availableSoftware.map(software => (
          <div
            key={software}
            draggable
            onDragStart={e => handleDragStart(e, software)}
            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>{software}</span>
            <span className="text-sm text-gray-500">
              {softwareData[software]}GB
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SoftwareList
