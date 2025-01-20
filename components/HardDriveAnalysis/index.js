import React, { useState, useEffect, useCallback } from 'react'
import PresetSidebar from './PresetSidebar'
import SoftwareList from './SoftwareList'
import StorageSelector from '../StorageSelector'
import { useTranslation } from 'next-i18next'
import { convertToGB, formatSize } from '../../utils/sizeUtils'
import _ from 'lodash'

const HardDriveAnalysis = ({ searchQuery }) => {
  const { t } = useTranslation('common')
  const [selectedSoftware, setSelectedSoftware] = useState([])
  const [selectedPresetId, setSelectedPresetId] = useState(null)
  const [usedSpace, setUsedSpace] = useState(0)
  const [softwareList, setSoftwareList] = useState([])
  const [storageLimit, setStorageLimit] = useState(256)
  const [systemSpace, setSystemSpace] = useState({
    size: 0,
    details: null,
  })
  const [isResetting, setIsResetting] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState(50)
  const [isInfoExpanded, setIsInfoExpanded] = useState(false)
  const [isProgressBarSticky, setIsProgressBarSticky] = useState(false)

  useEffect(() => {
    fetch('/software-data.json')
      .then(response => response.json())
      .then(data => {
        const totalSystemSpace =
          convertToGB(data.system.os.size) +
          convertToGB(data.system.preinstalled.size) +
          convertToGB(data.system.upgrade_space.size)
        setSystemSpace({
          size: totalSystemSpace,
          details: data.system,
        })
        setSoftwareList(data.software)
      })
      .catch(error => console.error('Error loading data:', error))
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const progressBar = document.getElementById('main-progress-bar')
      if (progressBar) {
        const rect = progressBar.getBoundingClientRect()
        setIsProgressBarSticky(rect.bottom < 0)
      }
    }

    const throttledScroll = _.throttle(handleScroll, 100)
    window.addEventListener('scroll', throttledScroll)
    return () => {
      window.removeEventListener('scroll', throttledScroll)
      throttledScroll.cancel()
    }
  }, [])

  const calculateTotalSize = useCallback(() => {
    return selectedSoftware.reduce((total, id) => {
      const software = softwareList.find(s => s.id === id)
      return total + (software ? convertToGB(software.size) : 0)
    }, 0)
  }, [selectedSoftware, softwareList])

  useEffect(() => {
    const newUsedSpace = calculateTotalSize()
    setUsedSpace(newUsedSpace)
  }, [selectedSoftware, softwareList, calculateTotalSize])

  const handlePresetSelect = preset => {
    setSelectedPresetId(preset.id)
    setSelectedSoftware(preset.software)
  }

  const handleSelectedSoftwareChange = newSelection => {
    setSelectedPresetId(null)
    setSelectedSoftware(newSelection)
  }

  const handleAvailableSoftwareUpdate = newSoftwareList => {
    setSoftwareList(newSoftwareList)
  }

  const totalUsedSpace = usedSpace + systemSpace.size
  const usagePercentage = (totalUsedSpace / storageLimit) * 100

  const handleReset = () => {
    const confirmReset = window.confirm(
      'This will reset all selections to default. Are you sure?'
    )
    if (confirmReset) {
      setIsResetting(true)
      setSelectedSoftware([])
      setSelectedPresetId(null)
      setUsedSpace(0)
      setTimeout(() => {
        setIsResetting(false)
      }, 0)
    }
  }

  const handleMouseMove = e => {
    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setTooltipPosition(percentage)
  }

  return (
    <div
      className="rounded-2xl border border-black/[.08] dark:border-white/[.145] 
      bg-white dark:bg-gray-900 shadow-lg w-full"
    >
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2
            className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 
            dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent"
          >
            {t('title')}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm font-medium rounded-lg
                border border-gray-200 dark:border-gray-700
                text-gray-600 dark:text-gray-300
                hover:bg-gray-50 dark:hover:bg-gray-800
                transition-colors duration-200"
              title="Reset to default presets"
            >
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset
              </div>
            </button>
            <StorageSelector onStorageChange={setStorageLimit} />
          </div>
        </div>

        {/* Sticky Progress Bar */}
        {isProgressBarSticky && (
          <div
            data-testid="sticky-progress-bar"
            className="fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-sm transition-all duration-300 transform translate-y-0"
          >
            <div className="max-w-screen-xl mx-auto px-6 py-3">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <div>
                  {formatSize(totalUsedSpace)} of {storageLimit} GB used
                </div>
                <div>
                  {formatSize(Math.max(0, storageLimit - totalUsedSpace))}{' '}
                  available
                </div>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                {/* OS Space - Only left rounded */}
                <div
                  className="h-full bg-gray-300 dark:bg-gray-600 absolute left-0"
                  style={{
                    width: `${
                      (convertToGB(systemSpace.details?.os.size || '0 GB') /
                        storageLimit) *
                      100
                    }%`,
                    borderRadius: '9999px 0 0 9999px',
                  }}
                />
                {/* Pre-installed Apps - No rounded corners */}
                <div
                  className="h-full bg-gray-400 dark:bg-gray-500 absolute"
                  style={{
                    width: `${
                      (convertToGB(
                        systemSpace.details?.preinstalled.size || '0 GB'
                      ) /
                        storageLimit) *
                      100
                    }%`,
                    left: `${
                      (convertToGB(systemSpace.details?.os.size || '0 GB') /
                        storageLimit) *
                      100
                    }%`,
                  }}
                />
                {/* Upgrade Space - Rounded on right if no user space */}
                <div
                  className="h-full bg-gray-500 dark:bg-gray-400 absolute"
                  style={{
                    width: `${
                      (convertToGB(
                        systemSpace.details?.upgrade_space.size || '0 GB'
                      ) /
                        storageLimit) *
                      100
                    }%`,
                    left: `${
                      (convertToGB(systemSpace.details?.os.size || '0 GB') /
                        storageLimit +
                        convertToGB(
                          systemSpace.details?.preinstalled.size || '0 GB'
                        ) /
                          storageLimit) *
                      100
                    }%`,
                    borderRadius: usedSpace === 0 ? '0 9999px 9999px 0' : '0',
                  }}
                />
                {/* User Space - Only right rounded */}
                <div
                  className={`h-full relative transition-all duration-500 ease-out ${
                    usagePercentage > 90
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : usagePercentage > 70
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                  style={{
                    width: `${(usedSpace / storageLimit) * 100}%`,
                    marginLeft: `${(systemSpace.size / storageLimit) * 100}%`,
                    borderRadius: usedSpace > 0 ? '0 9999px 9999px 0' : '0',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Progress Bar */}
        <div id="main-progress-bar" className="mt-6 space-y-4">
          {/* Info Section */}
          <div className="relative">
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
              <span>{t('aboutSoftwareSizes')}</span>
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
                ${
                  isInfoExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <p className="leading-relaxed">{t('softwareSizesDescription')}</p>
            </div>
          </div>

          {/* Storage Usage Info */}
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              {formatSize(totalUsedSpace)} of {storageLimit} GB used
            </div>
            <div>
              {formatSize(Math.max(0, storageLimit - totalUsedSpace))} available
            </div>
          </div>

          {/* Progress Bar with Tooltip */}
          <div className="relative group" onMouseMove={handleMouseMove}>
            <div
              className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden 
              ring-1 ring-black/[.04] dark:ring-white/[.05]"
            >
              {/* OS Space - Only left rounded */}
              <div
                className="h-full bg-gray-300 dark:bg-gray-600 absolute left-0"
                style={{
                  width: `${
                    (convertToGB(systemSpace.details?.os.size || '0 GB') /
                      storageLimit) *
                    100
                  }%`,
                  borderRadius: '9999px 0 0 9999px',
                }}
              />
              {/* Pre-installed Apps - No rounded corners */}
              <div
                className="h-full bg-gray-400 dark:bg-gray-500 absolute"
                style={{
                  width: `${
                    (convertToGB(
                      systemSpace.details?.preinstalled.size || '0 GB'
                    ) /
                      storageLimit) *
                    100
                  }%`,
                  left: `${
                    (convertToGB(systemSpace.details?.os.size || '0 GB') /
                      storageLimit) *
                    100
                  }%`,
                }}
              />
              {/* Upgrade Space - Rounded on right if no user space */}
              <div
                className="h-full bg-gray-500 dark:bg-gray-400 absolute"
                style={{
                  width: `${
                    (convertToGB(
                      systemSpace.details?.upgrade_space.size || '0 GB'
                    ) /
                      storageLimit) *
                    100
                  }%`,
                  left: `${
                    (convertToGB(systemSpace.details?.os.size || '0 GB') /
                      storageLimit +
                      convertToGB(
                        systemSpace.details?.preinstalled.size || '0 GB'
                      ) /
                        storageLimit) *
                    100
                  }%`,
                  borderRadius: usedSpace === 0 ? '0 9999px 9999px 0' : '0',
                }}
              />
              {/* User Space - Only right rounded */}
              <div
                className={`h-full relative transition-all duration-500 ease-out
                  ${
                    usagePercentage > 90
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : usagePercentage > 70
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                style={{
                  width: `${(usedSpace / storageLimit) * 100}%`,
                  marginLeft: `${(systemSpace.size / storageLimit) * 100}%`,
                  borderRadius: usedSpace > 0 ? '0 9999px 9999px 0' : '0',
                }}
              />
            </div>

            {/* Tooltip */}
            <div
              className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 
                transition-opacity pointer-events-none"
              style={{
                left: `${tooltipPosition}%`,
                transform: `translateX(-${tooltipPosition > 50 ? 100 : 0}%)`,
              }}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3
                border border-gray-200 dark:border-gray-700 w-80"
              >
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-400 min-w-[120px]">
                      {t(`categories.${systemSpace.details?.os.id}`)}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap flex-shrink-0">
                      {systemSpace.details?.os.size}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-400 min-w-[120px]">
                      {t(`categories.${systemSpace.details?.preinstalled.id}`)}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap flex-shrink-0">
                      {systemSpace.details?.preinstalled.size}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-400 min-w-[120px] overflow-hidden text-ellipsis">
                      {t(`categories.${systemSpace.details?.upgrade_space.id}`)}
                      :
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap flex-shrink-0">
                      {systemSpace.details?.upgrade_space.size}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 min-w-[120px]">
                      User Software:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap flex-shrink-0">
                      {formatSize(usedSpace)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-gray-100 min-w-[120px]">
                      Total Used:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 whitespace-nowrap flex-shrink-0">
                      {formatSize(totalUsedSpace)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Exceeded Warning */}
          {totalUsedSpace > storageLimit && (
            <div className="flex items-center text-red-500 text-sm animate-pulse">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Storage limit exceeded by{' '}
              {formatSize(totalUsedSpace - storageLimit)}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
          <div className="lg:sticky lg:top-0">
            <PresetSidebar
              onPresetSelect={handlePresetSelect}
              selectedPresetId={selectedPresetId}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow p-6">
          <SoftwareList
            selectedSoftware={selectedSoftware}
            onSoftwareUpdate={handleSelectedSoftwareChange}
            onSoftwareListUpdate={handleAvailableSoftwareUpdate}
            searchQuery={searchQuery || ''}
            softwareList={softwareList}
          />
        </div>
      </div>
    </div>
  )
}

export default HardDriveAnalysis
