import React from 'react'

const HardDriveAnalysis = () => {
  return (
    <div className="p-4 rounded-lg border border-black/[.08] dark:border-white/[.145]">
      <h2 className="text-lg font-semibold mb-4">Storage Options</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span>256GB SSD</span>
          <span>+$0</span>
        </div>
        <div className="flex justify-between items-center">
          <span>512GB SSD</span>
          <span>+$200</span>
        </div>
        <div className="flex justify-between items-center">
          <span>1TB SSD</span>
          <span>+$400</span>
        </div>
      </div>
    </div>
  )
}

export default HardDriveAnalysis
