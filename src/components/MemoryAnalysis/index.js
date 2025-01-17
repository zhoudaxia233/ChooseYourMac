import React, { useState, useEffect } from 'react'

const MemoryAnalysis = ({ selectedMemory, onMemoryChange }) => {
  const [currentMemory, setCurrentMemory] = useState(16)
  const [isOpen, setIsOpen] = useState(false)
  const [scenarios, setScenarios] = useState([])
  const [memoryOptions, setMemoryOptions] = useState([])
  const [isInfoExpanded, setIsInfoExpanded] = useState(false)

  useEffect(() => {
    fetch('/memory-data.json')
      .then(response => response.json())
      .then(data => {
        setScenarios(data.scenarios)
        setMemoryOptions(data.memoryOptions)
      })
      .catch(error => console.error('Error loading memory data:', error))
  }, [])

  const getStatusColor = status => {
    switch (status) {
      case 'high':
        return 'text-red-500 dark:text-red-400'
      case 'medium':
        return 'text-yellow-500 dark:text-yellow-400'
      case 'low':
        return 'text-green-500 dark:text-green-400'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  return (
    <div
      className="rounded-2xl border border-black/[.08] dark:border-white/[.145] 
      bg-white dark:bg-gray-900 shadow-lg w-full p-6 space-y-6"
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h2
          className="text-2xl font-semibold 
          bg-gradient-to-r from-gray-900 to-gray-600 
          dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent"
        >
          Memory Pressure Analysis
        </h2>

        {/* Info Section */}
        <div className="relative mt-4">
          <button
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 
              hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>About Memory Estimates</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isInfoExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Expandable Info Box */}
          <div
            className={`mt-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm 
              text-gray-600 dark:text-gray-400 transition-all duration-200 overflow-hidden
              ${isInfoExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <p className="leading-relaxed">
              The performance estimates in this tool are based on Apple's
              M-series unified memory architecture. These values are{' '}
              <strong>subjective approximations</strong>, gathered from forums
              and YouTube analyses, and are not standardized measurements. They
              are for <strong>reference only</strong> and may vary depending on
              individual workloads.
            </p>
          </div>
        </div>

        {/* Memory Selector */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-semibold 
              bg-gradient-to-r from-gray-900 to-gray-600 
              dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent"
            >
              Memory Performance Overview
            </h2>
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-3 py-1 rounded-full 
                  bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
                  text-sm font-medium text-gray-600 dark:text-gray-400 
                  transition-colors relative"
              >
                <span>{currentMemory}GB Total</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsOpen(false)}
                  />
                  <div
                    className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 
                      rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-40"
                  >
                    {memoryOptions.map(memory => (
                      <button
                        key={memory}
                        onClick={() => {
                          setCurrentMemory(memory)
                          setIsOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 
                          dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300
                          transition-colors"
                      >
                        {memory}GB Memory
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-3 gap-4">
        {scenarios.map(scenario => (
          <div
            key={scenario.id}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800/50 space-y-4"
          >
            {/* Scenario Header */}
            <div className="flex items-center gap-2">
              <span className="text-xl">{scenario.icon}</span>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {scenario.name}
              </h3>
            </div>

            {/* Memory Pressure */}
            <div className="space-y-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Memory Pressure:
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all duration-300
                      ${
                        scenario.pressureByMemory[String(currentMemory)] > 80
                          ? 'bg-red-500'
                          : scenario.pressureByMemory[String(currentMemory)] >
                            50
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    style={{
                      width: `${
                        scenario.pressureByMemory[String(currentMemory)]
                      }%`,
                    }}
                  />
                </div>
                <span
                  className={`text-sm font-medium ${getStatusColor(
                    scenario.pressureByMemory[String(currentMemory)] > 80
                      ? 'high'
                      : scenario.pressureByMemory[String(currentMemory)] > 50
                      ? 'medium'
                      : 'low'
                  )}`}
                >
                  {scenario.pressureByMemory[String(currentMemory)]}%
                </span>
              </div>
              <div
                className={`text-sm font-medium ${getStatusColor(
                  scenario.pressureByMemory[String(currentMemory)] > 80
                    ? 'high'
                    : scenario.pressureByMemory[String(currentMemory)] > 50
                    ? 'medium'
                    : 'low'
                )}`}
              >
                {scenario.pressureByMemory[String(currentMemory)] > 80
                  ? 'High'
                  : scenario.pressureByMemory[String(currentMemory)] > 50
                  ? 'Medium'
                  : 'Low'}{' '}
                Pressure
              </div>
            </div>

            {/* Apps List */}
            <div className="space-y-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Simultaneous Apps:
              </div>
              <div className="space-y-1">
                {scenario.apps.map(app => (
                  <div
                    key={app.name}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span>{app.icon}</span>
                    <span>{app.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="space-y-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Recommendation:
              </div>
              <p
                className={`text-sm ${
                  scenario.recommendations[String(currentMemory)].upgrade
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {scenario.recommendations[String(currentMemory)].text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MemoryAnalysis
