import React, { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { convertToGB, formatSize } from '../../utils/sizeUtils'

const PresetSidebar = ({ onPresetSelect, selectedPresetId }) => {
  const { t } = useTranslation('common')
  const [presets, setPresets] = useState([])
  const [softwareData, setSoftwareData] = useState([])

  useEffect(() => {
    // Load presets and software data
    Promise.all([
      fetch('/presets.json').then(res => res.json()),
      fetch('/software-data.json').then(res => res.json()),
    ])
      .then(([presetsData, softwareData]) => {
        setPresets(presetsData.presets)
        setSoftwareData(softwareData.software)
      })
      .catch(error => console.error('Error loading data:', error))
  }, [])

  // Calculate total size for preset
  const calculatePresetSize = software => {
    return software.reduce((total, id) => {
      const softwareItem = softwareData.find(s => s.id === id)
      return total + (softwareItem ? convertToGB(softwareItem.size) : 0)
    }, 0)
  }

  const getSoftwareNames = software => {
    const names = software
      .slice(0, 1)
      .map(id => softwareData.find(s => s.id === id)?.name || id)

    return software.length > 1
      ? `${names.join(', ')} +${software.length - 1} more`
      : names.join(', ')
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {t('presets.recommendedPresets')}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('presets.quickSetup')}
      </p>
      <div className="space-y-3">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset)}
            className={`w-full p-3 rounded-xl text-left transition-all duration-200
              ${
                selectedPresetId === preset.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{preset.name}</h4>
                <span className="text-sm opacity-80">
                  {formatSize(calculatePresetSize(preset.software))}
                </span>
              </div>
              <p
                className={`text-sm truncate ${
                  selectedPresetId === preset.id
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {getSoftwareNames(preset.software)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PresetSidebar
