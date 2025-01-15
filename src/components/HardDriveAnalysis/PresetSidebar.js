import React, { useState, useEffect } from 'react'

const PresetSidebar = ({ onPresetSelect, selectedPresetId }) => {
  const [presets, setPresets] = useState([])

  useEffect(() => {
    fetch('/presets.json')
      .then(response => response.json())
      .then(data => setPresets(data.presets))
      .catch(error => console.error('Error loading presets:', error))
  }, [])

  return (
    <div>
      {/* Title Section - Centered */}
      <div className="flex flex-col items-center justify-center space-y-1 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Recommended Presets
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Quick Setup</p>
      </div>

      {/* Presets List */}
      <div className="space-y-3">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset)}
            className={`w-full p-3 rounded-xl border transition-all duration-200
              ${
                selectedPresetId === preset.id
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {preset.name}
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {preset.totalSize}GB
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 text-left">
                {preset.software.join(', ')}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PresetSidebar
