import React from 'react'

const presets = [
  {
    id: 'web-dev',
    name: 'Web Developer',
    software: ['VS Code', 'Docker', 'Node.js', 'Chrome'],
    totalSize: 45,
  },
  {
    id: 'video-edit',
    name: 'Video Editor',
    software: ['Final Cut Pro', 'Adobe Premiere', 'DaVinci Resolve'],
    totalSize: 85,
  },
  {
    id: 'designer',
    name: 'Designer',
    software: ['Figma', 'Adobe Photoshop', 'Adobe Illustrator'],
    totalSize: 65,
  },
]

const PresetSidebar = ({ onPresetSelect }) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm text-gray-500">Recommended Presets</h3>
      <div className="space-y-2">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
