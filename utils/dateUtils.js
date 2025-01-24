export function getDaysSinceDate(buildTimestamp) {
  const lastUpdate = new Date(buildTimestamp)
  const today = new Date()

  const utcLast = Date.UTC(
    lastUpdate.getUTCFullYear(),
    lastUpdate.getUTCMonth(),
    lastUpdate.getUTCDate()
  )

  const utcToday = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  )

  return Math.floor((utcToday - utcLast) / (1000 * 60 * 60 * 24))
}
