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
    <div className="space-y-2">
      <h3 className="font-medium text-sm text-gray-500">Recommended Presets</h3>
      <div className="space-y-2">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedPresetId === preset.id
                ? 'bg-blue-50 dark:bg-blue-900/30'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="font-medium">{preset.name}</div>
            <div className="text-sm text-gray-500">{preset.totalSize}GB</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PresetSidebar
