import React, { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { convertToGB, formatSize } from '../../utils/sizeUtils'

const PresetSidebar = ({ onPresetSelect, selectedPresetId }) => {
  const { t } = useTranslation('common')
  const [presets, setPresets] = useState([])
  const [softwareData, setSoftwareData] = useState([])

  useEffect(() => {
    // 加载预设和软件数据
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

  // 计算预设的总大小
  const calculatePresetSize = software => {
    return software.reduce((total, id) => {
      const softwareItem = softwareData.find(s => s.id === id)
      return total + (softwareItem ? convertToGB(softwareItem.size) : 0)
    }, 0)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Recommended Presets
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">Quick Setup</p>
      <div className="space-y-3">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset)}
            className={`w-full p-4 rounded-xl text-left transition-all duration-200
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
                className={`text-sm ${
                  selectedPresetId === preset.id
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {preset.software.join(', ')}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PresetSidebar
