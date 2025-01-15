import React, { useState, useEffect } from 'react'
import PresetSidebar from './PresetSidebar'
import SoftwareList from './SoftwareList'
import StorageSelector from '../StorageSelector'

const HardDriveAnalysis = ({ searchQuery }) => {
  const [selectedSoftware, setSelectedSoftware] = useState([])
  const [selectedPresetId, setSelectedPresetId] = useState(null)
  const [usedSpace, setUsedSpace] = useState(0)
  const [softwareList, setSoftwareList] = useState([])
  const [storageLimit, setStorageLimit] = useState(256)

  useEffect(() => {
    fetch('/software-data.json')
      .then(response => response.json())
      .then(data => setSoftwareList(data.software))
      .catch(error => console.error('Error loading software data:', error))
  }, [])

  const calculateUsedSpace = softwareIds => {
    return softwareIds.reduce((total, id) => {
      const software = softwareList.find(s => s.id === id)
      return total + (software?.size_in_GB || 0)
    }, 0)
  }

  useEffect(() => {
    const newUsedSpace = calculateUsedSpace(selectedSoftware)
    setUsedSpace(newUsedSpace)
  }, [selectedSoftware, softwareList])

  const handlePresetSelect = preset => {
    setSelectedPresetId(preset.id)
    setSelectedSoftware(preset.software)
  }

  const handleSoftwareUpdate = newSoftwareList => {
    setSelectedPresetId(null)
    setSelectedSoftware(newSoftwareList)
  }

  const usagePercentage = (usedSpace / storageLimit) * 100

  const handleReset = () => {
    const confirmReset = window.confirm(
      'This will reset all selections to default. Are you sure?'
    )
    if (confirmReset) {
      setSelectedSoftware([])
      setSelectedPresetId(null)
      setUsedSpace(0)
    }
  }

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
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm font-medium rounded-lg
                border border-gray-200 dark:border-gray-700
                text-gray-600 dark:text-gray-300
                hover:bg-gray-50 dark:hover:bg-gray-800
                transition-colors duration-200"
              title="Reset to default presets"
            >
              <div className="flex items-center gap-1.5">
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset
              </div>
            </button>
            <StorageSelector onStorageChange={setStorageLimit} />
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
              Available: {(storageLimit - usedSpace).toFixed(1)}GB
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
              style={{
                width: `${Math.min((usedSpace / storageLimit) * 100, 100)}%`,
              }}
            />
          </div>

          {usedSpace > storageLimit && (
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
              Storage limit exceeded by {(usedSpace - storageLimit).toFixed(1)}
              GB
            </p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
          <div className="lg:sticky lg:top-0">
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
