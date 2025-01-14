import React, { useState, useEffect } from 'react'
import PresetSidebar from './PresetSidebar'
import SoftwareList from './SoftwareList'

const HardDriveAnalysis = () => {
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
    <div className="p-4 rounded-lg border border-black/[.08] dark:border-white/[.145] space-y-6">
      <h2 className="text-lg font-semibold">Storage Analysis</h2>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Used Space: {usedSpace.toFixed(1)}GB</span>
          <span>Available: {(STORAGE_LIMIT - usedSpace).toFixed(1)}GB</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        {usagePercentage > 100 && (
          <p className="text-red-500 text-sm">
            Warning: Storage limit exceeded by{' '}
            {(usedSpace - STORAGE_LIMIT).toFixed(1)}GB
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <PresetSidebar
            onPresetSelect={handlePresetSelect}
            selectedPresetId={selectedPresetId}
          />
        </div>
        <div className="col-span-2">
          <SoftwareList
            selectedSoftware={selectedSoftware}
            onSoftwareUpdate={handleSoftwareUpdate}
          />
        </div>
      </div>
    </div>
  )
}

export default HardDriveAnalysis
