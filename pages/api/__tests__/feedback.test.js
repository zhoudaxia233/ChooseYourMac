import { createMocks } from 'node-mocks-http'
import handler from '../feedback'

// Mock the entire mongodb module first
jest.mock('mongodb', () => {
  const insertOneMock = jest.fn().mockResolvedValue({ insertedId: 'mock-id' })
  const collectionMock = jest.fn().mockReturnValue({ insertOne: insertOneMock })
  const dbMock = jest.fn().mockReturnValue({ collection: collectionMock })
  const closeMock = jest.fn().mockResolvedValue(null)
  const connectMock = jest.fn().mockResolvedValue({
    db: dbMock,
    close: closeMock,
  })

  return {
    MongoClient: {
      connect: connectMock,
    },
  }
})

// Get the mocked functions for assertions
const { MongoClient } = require('mongodb')
const mockConnect = MongoClient.connect

describe('Feedback API', () => {
  let mockClient
  let consoleErrorSpy

  beforeAll(async () => {
    process.env.MONGODB_URI = 'mongodb://fake-uri'
    mockClient = await mockConnect()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    delete process.env.MONGODB_URI
    consoleErrorSpy.mockRestore()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(405)
  })

  test('successfully stores feedback with user agent info', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
      },
      body: {
        text: 'Test feedback',
        locale: 'en',
      },
    })

    await handler(req, res)

    // Verify MongoDB interactions
    expect(mockConnect).toHaveBeenCalledWith('mongodb://fake-uri')
    expect(mockClient.db).toHaveBeenCalledWith('chooseyourmac')
    expect(mockClient.db().collection).toHaveBeenCalledWith('feedback')

    // Verify stored data includes client info
    const storedData = mockClient.db().collection().insertOne.mock.calls[0][0]
    expect(storedData.client).toBe('Chrome (Desktop)')
    expect(storedData.text).toBe('Test feedback')
    expect(storedData.locale).toBe('en')
    expect(storedData.createdAt).toBeInstanceOf(Date)

    expect(res._getStatusCode()).toBe(201)
  })

  test('handles invalid feedback data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        text: 'x'.repeat(1001), // Too long
        locale: 123, // Wrong type
      },
    })

    await handler(req, res)
    expect(res._getStatusCode()).toBe(400)
  })

  test('sanitizes feedback text', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        text: '<script>alert("xss")</script>Test feedback',
        locale: 'en',
      },
    })

    await handler(req, res)

    const storedData = mockClient.db().collection().insertOne.mock.calls[0][0]
    expect(storedData.text).not.toContain('<script>')
  })
})
