import React, { useState, useEffect } from 'react'

const MemoryAnalysis = ({ searchQuery }) => {
  const [memoryOptions, setMemoryOptions] = useState([])

  useEffect(() => {
    fetch('/configurations.json')
      .then(response => response.json())
      .then(data => setMemoryOptions(data.memory))
      .catch(error =>
        console.error('Error loading memory configurations:', error)
      )
  }, [])

  const filteredOptions = memoryOptions.filter(option =>
    `${option.size} ${option.type}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 rounded-lg border border-black/[.08] dark:border-white/[.145]">
      <h2 className="text-lg font-semibold mb-4">Memory Options</h2>
      <div className="space-y-3">
        {filteredOptions.map((option, index) => (
          <div key={index} className="flex justify-between items-center">
            <span>
              {option.size} {option.type}
            </span>
            <span>{option.price === 0 ? '+$0' : `+$${option.price}`}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MemoryAnalysis
