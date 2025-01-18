/**
 * Converts size string to GB number
 * @param {string} sizeStr - Size string like "350 MB" or "1.5 GB"
 * @returns {number} Size in GB
 */
export function convertToGB(sizeStr) {
  const [value, unit] = sizeStr.split(' ')
  const numValue = parseFloat(value)

  switch (unit.toUpperCase()) {
    case 'MB':
      return numValue / 1024
    case 'GB':
      return numValue
    default:
      throw new Error(
        `Unsupported unit: ${unit}. Only MB and GB are supported.`
      )
  }
}

/**
 * Formats size in GB to human readable string
 * @param {number} sizeInGB - Size in GB
 * @returns {string} Formatted size string
 */
export function formatSize(sizeInGB) {
  if (sizeInGB < 1) {
    return `${Math.round(sizeInGB * 1024)} MB`
  }
  return `${sizeInGB.toFixed(1)} GB`
}
