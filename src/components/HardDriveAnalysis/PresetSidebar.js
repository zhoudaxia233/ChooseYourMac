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
    <div className="w-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-base text-gray-900 dark:text-gray-100">
          Recommended Presets
        </h3>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Quick Setup
        </span>
      </div>

      <div className="grid gap-3">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset)}
            className={`
              group relative w-full text-left p-4 rounded-xl 
              transition-all duration-300 border
              ${
                selectedPresetId === preset.id
                  ? 'bg-blue-50/90 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800 shadow-md shadow-blue-500/10'
                  : 'border-transparent hover:bg-gray-50/90 hover:border-gray-200 dark:hover:bg-gray-800/50 dark:hover:border-gray-700 hover:shadow-md hover:shadow-gray-500/10'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {preset.name}
              </div>
              <div
                className={`
                  px-2.5 py-1 rounded-full text-xs font-medium transition-colors
                  ${
                    selectedPresetId === preset.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }
                `}
              >
                {preset.totalSize}GB
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {preset.software.join(', ')}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PresetSidebar
