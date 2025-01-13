import React from 'react'

export const softwareData = {
  'VS Code': 0.5,
  Docker: 3,
  'Node.js': 0.2,
  Chrome: 0.3,
  'Final Cut Pro': 35,
  'Adobe Premiere': 25,
  'DaVinci Resolve': 25,
  Figma: 0.5,
  'Adobe Photoshop': 25,
  'Adobe Illustrator': 25,
}

const SoftwareList = ({ selectedSoftware, onSoftwareUpdate }) => {
  return (
    <div className="space-y-2">
      {selectedSoftware.map((software, index) => (
        <div
          key={software}
          className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <span>{software}</span>
          <span className="text-sm text-gray-500">
            {softwareData[software]}GB
          </span>
        </div>
      ))}
    </div>
  )
}

export default SoftwareList
