import React, { useState } from 'react'

const MemoryAnalysis = () => {
  const [currentMemory, setCurrentMemory] = useState(16)
  const [isOpen, setIsOpen] = useState(false)
  const memoryOptions = [8, 16, 32]

  const scenarios = [
    {
      id: 'gaming',
      name: 'Gaming',
      icon: '🎮',
      pressure: 85,
      status: 'high',
      apps: [
        { name: 'Steam', icon: '🎮' },
        { name: 'Discord', icon: '🗨️' },
        { name: 'Spotify', icon: '🎵' },
      ],
      recommendation: {
        text: 'Upgrade to 24GB for smoother gaming',
        upgrade: currentMemory < 24,
      },
    },
    {
      id: 'video',
      name: 'Video Editing',
      icon: '🎥',
      pressure: 60,
      status: 'medium',
      apps: [
        { name: 'Chrome (10)', icon: '🖥️' },
        { name: 'Photoshop', icon: '🖌️' },
        { name: 'Spotify', icon: '🎵' },
      ],
      recommendation: {
        text: '16GB sufficient for most 4K editing',
        upgrade: currentMemory < 16,
      },
    },
    {
      id: 'data',
      name: 'Data Analysis',
      icon: '📊',
      pressure: 35,
      status: 'low',
      apps: [
        { name: 'Excel', icon: '📊' },
        { name: 'Python', icon: '🐍' },
        { name: 'Chrome (5)', icon: '🖥️' },
      ],
      recommendation: {
        text: '8GB sufficient for simple analysis',
        upgrade: currentMemory < 8,
      },
    },
  ]

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
      {/* Header */}
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
                        scenario.pressure > 80
                          ? 'bg-red-500'
                          : scenario.pressure > 50
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    style={{ width: `${scenario.pressure}%` }}
                  />
                </div>
                <span
                  className={`text-sm font-medium ${getStatusColor(
                    scenario.status
                  )}`}
                >
                  {scenario.pressure}%
                </span>
              </div>
              <div
                className={`text-sm font-medium ${getStatusColor(
                  scenario.status
                )}`}
              >
                {scenario.status.charAt(0).toUpperCase() +
                  scenario.status.slice(1)}{' '}
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
                    className="flex items-center gap-2 text-sm
                      text-gray-700 dark:text-gray-300"
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
                  scenario.recommendation.upgrade
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {scenario.recommendation.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MemoryAnalysis
