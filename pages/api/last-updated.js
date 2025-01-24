import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    const metaPath = path.join(process.cwd(), 'public', 'meta.json')
    const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    const { latestUpdate } = metaData

    const latestDate = new Date(latestUpdate)
    const formattedUTC =
      latestDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      }) + ' UTC'

    console.log('Last updated:', latestUpdate)
    console.log('Formatted UTC:', formattedUTC)

    res.status(200).json({
      lastUpdated: latestUpdate,
      formattedUTC,
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(200).json({
      // Fallback to a default value if meta.json is not found
      lastUpdated: new Date().toISOString(),
      formattedUTC: 'N/A',
    })
  }
}
