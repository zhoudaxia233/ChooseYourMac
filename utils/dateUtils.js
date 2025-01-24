export function getDaysSinceDate(dateString) {
  const lastUpdate = new Date(dateString)
  const today = new Date()

  console.log('Current Time (today):', today.toISOString())
  console.log('Last Update Time (dateString):', lastUpdate.toISOString())

  // Reset time part to compare dates only
  lastUpdate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diffTime = Math.abs(today - lastUpdate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays === 0 ? 0 : diffDays
}
