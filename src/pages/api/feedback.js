import fs from 'fs'
import path from 'path'

function parseUserAgent(userAgent) {
  const ua = userAgent?.toLowerCase() || ''
  let device = 'Desktop'
  if (/(android|webos|iphone|ipad|ipod|blackberry|windows phone)/i.test(ua)) {
    device = 'Mobile'
  } else if (/tablet|ipad/i.test(ua)) {
    device = 'Tablet'
  }

  // Extract browser name
  let browser = 'Unknown'
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'

  return `${browser} (${device})`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { feedback, locale } = req.body

    // Validate feedback
    if (!feedback || typeof feedback !== 'string' || feedback.length > 1000) {
      return res.status(400).json({ error: 'Invalid feedback' })
    }

    const feedbackDir = path.join(process.cwd(), 'feedback')
    const feedbackFile = path.join(feedbackDir, 'feedback.json')

    // Create feedback directory if it doesn't exist
    if (!fs.existsSync(feedbackDir)) {
      fs.mkdirSync(feedbackDir, { recursive: true })
    }

    // Read existing feedback with error handling
    let feedbackData = []
    if (fs.existsSync(feedbackFile)) {
      try {
        const fileContent = fs.readFileSync(feedbackFile, 'utf8')
        // Handle empty file case
        if (fileContent.trim()) {
          feedbackData = JSON.parse(fileContent)
        }
        // Ensure feedbackData is an array
        if (!Array.isArray(feedbackData)) {
          feedbackData = []
        }
      } catch (error) {
        console.error('Error parsing feedback file:', error)
        feedbackData = [] // Reset to empty array if parsing fails
      }
    }

    // Add new feedback with rate limiting check
    const recentFeedback = feedbackData.filter(
      f => Date.now() - new Date(f.date).getTime() < 60000 // 1 minute
    )

    if (recentFeedback.length >= 5) {
      return res.status(429).json({ error: 'Too many requests' })
    }

    // Add new feedback with simplified structure
    feedbackData.push({
      id: Date.now(),
      text: feedback,
      date: new Date().toISOString(),
      client: parseUserAgent(req.headers['user-agent']),
      locale: locale || 'unknown',
    })

    // Keep only last 1000 feedback entries
    feedbackData = feedbackData.slice(-1000)

    // Write updated feedback
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbackData, null, 2))

    res.status(200).json({ message: 'Feedback submitted successfully' })
  } catch (error) {
    console.error('Error saving feedback:', error)
    res.status(500).json({ error: 'Failed to save feedback' })
  }
}
