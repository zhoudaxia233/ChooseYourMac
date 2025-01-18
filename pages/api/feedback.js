import { MongoClient } from 'mongodb'
import { sanitize } from 'isomorphic-dompurify'

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
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Validate input
    const { text, locale } = req.body
    if (!text || typeof text !== 'string' || text.length > 1000) {
      return res.status(400).json({ message: 'Invalid feedback text' })
    }
    if (!locale || typeof locale !== 'string' || locale.length > 10) {
      return res.status(400).json({ message: 'Invalid locale' })
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local')
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI)
    const db = client.db('chooseyourmac')

    // Sanitize input before storing
    const sanitizedText = sanitize(text)

    const feedback = await db.collection('feedback').insertOne({
      text: sanitizedText,
      locale,
      client: parseUserAgent(req.headers['user-agent']),
      createdAt: new Date(),
    })

    await client.close()

    res
      .status(201)
      .json({ message: 'Feedback stored', id: feedback.insertedId })
  } catch (error) {
    console.error('Database error:', error)
    res
      .status(500)
      .json({ message: 'Error storing feedback', error: error.message })
  }
}
