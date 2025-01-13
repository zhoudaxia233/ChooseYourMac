import React from 'react'

const MemoryAnalysis = () => {
  return (
    <div className="p-4 rounded-lg border border-black/[.08] dark:border-white/[.145]">
      <h2 className="text-lg font-semibold mb-4">Memory Options</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span>8GB Unified Memory</span>
          <span>+$0</span>
        </div>
        <div className="flex justify-between items-center">
          <span>16GB Unified Memory</span>
          <span>+$200</span>
        </div>
        <div className="flex justify-between items-center">
          <span>24GB Unified Memory</span>
          <span>+$400</span>
        </div>
      </div>
    </div>
  )
}

export default MemoryAnalysis
