import React, { useState, useEffect } from 'react'
import PresetSidebar from './PresetSidebar'
import SoftwareList from './SoftwareList'

const HardDriveAnalysis = ({ searchQuery }) => {
  const [selectedSoftware, setSelectedSoftware] = useState([])
  const [selectedPresetId, setSelectedPresetId] = useState(null)
  const [usedSpace, setUsedSpace] = useState(0)
  const [softwareData, setSoftwareData] = useState({})
  const STORAGE_LIMIT = 128

  useEffect(() => {
    fetch('/software-data.json')
      .then(response => response.json())
      .then(data => setSoftwareData(data))
      .catch(error => console.error('Error loading software data:', error))
  }, [])

  const calculateUsedSpace = software => {
    return software.reduce((total, app) => {
      const size = softwareData[app] || 0
      return total + size
    }, 0)
  }

  useEffect(() => {
    const newUsedSpace = calculateUsedSpace(selectedSoftware)
    setUsedSpace(newUsedSpace)
  }, [selectedSoftware, softwareData])

  const handlePresetSelect = preset => {
    setSelectedPresetId(preset.id)
    setSelectedSoftware(preset.software)
  }

  const handleSoftwareUpdate = newSoftwareList => {
    setSelectedPresetId(null) // Clear preset selection when software list is modified
    setSelectedSoftware(newSoftwareList)
  }

  const usagePercentage = (usedSpace / STORAGE_LIMIT) * 100

  return (
    <div
      className="rounded-2xl border border-black/[.08] dark:border-white/[.145] 
      bg-white dark:bg-gray-900 shadow-lg w-full"
    >
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2
            className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 
            dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent"
          >
            Storage Analysis
          </h2>
          <div
            className="text-sm font-medium px-3 py-1 rounded-full 
            bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            {STORAGE_LIMIT}GB Total
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-sm font-medium">
            <span className="flex items-center text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              Used: {usedSpace.toFixed(1)}GB
            </span>
            <span className="flex items-center text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 mr-2" />
              Available: {(STORAGE_LIMIT - usedSpace).toFixed(1)}GB
            </span>
          </div>

          <div
            className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden 
            ring-1 ring-black/[.04] dark:ring-white/[.05]"
          >
            <div
              className={`h-full transition-all duration-500 ease-out ${
                usagePercentage > 90
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : usagePercentage > 70
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>

          {usagePercentage > 100 && (
            <p className="flex items-center text-red-500 text-sm animate-pulse">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Storage limit exceeded by {(usedSpace - STORAGE_LIMIT).toFixed(1)}
              GB
            </p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
          <div className="lg:sticky lg:top-8">
            <PresetSidebar
              onPresetSelect={handlePresetSelect}
              selectedPresetId={selectedPresetId}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow p-6">
          <SoftwareList
            selectedSoftware={selectedSoftware}
            onSoftwareUpdate={handleSoftwareUpdate}
            searchQuery={searchQuery || ''}
          />
        </div>
      </div>
    </div>
  )
}

export default HardDriveAnalysis
