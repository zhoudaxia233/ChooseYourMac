import fs from 'fs'
import path from 'path'

function getAllJsonFiles(dirPath) {
  const files = fs.readdirSync(dirPath)
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(dirPath, file))
}

export default function handler(req, res) {
  try {
    const publicDir = path.join(process.cwd(), 'public')
    const jsonFiles = getAllJsonFiles(publicDir)

    // Get last modified time for all JSON files
    const lastModifiedDates = jsonFiles.map(filePath => {
      const stats = fs.statSync(filePath)
      return stats.mtime
    })

    // Find the most recent update time
    const latestUpdate = new Date(
      Math.max(...lastModifiedDates.map(date => date.getTime()))
    )

    res.status(200).json({
      lastUpdated: latestUpdate.toISOString(),
      files: jsonFiles.map(file => path.basename(file)), // Optional: return list of tracked files
    })
  } catch (error) {
    console.error('Error getting last modified date:', error)
    res.status(500).json({ error: 'Failed to get last modified date' })
  }
}
