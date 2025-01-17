import { convertToGB, formatSize } from '../sizeUtils'

describe('sizeUtils', () => {
  describe('convertToGB', () => {
    test('converts MB to GB correctly', () => {
      expect(convertToGB('512 MB')).toBe(0.5)
      expect(convertToGB('1024 MB')).toBe(1)
      expect(convertToGB('350 MB')).toBeCloseTo(0.341796875)
    })

    test('keeps GB as is', () => {
      expect(convertToGB('1.5 GB')).toBe(1.5)
      expect(convertToGB('2 GB')).toBe(2)
    })

    test('throws error for unsupported units', () => {
      expect(() => convertToGB('1 TB')).toThrow('Unsupported unit')
      expect(() => convertToGB('500 KB')).toThrow('Unsupported unit')
    })
  })

  describe('formatSize', () => {
    test('formats small sizes to MB', () => {
      expect(formatSize(0.5)).toBe('512 MB')
      expect(formatSize(0.341796875)).toBe('350 MB')
    })

    test('formats large sizes to GB', () => {
      expect(formatSize(1.5)).toBe('1.5 GB')
      expect(formatSize(2)).toBe('2.0 GB')
    })
  })
})
