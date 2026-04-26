import { describe, it, expect } from 'vitest'
import { formatDate } from './date'

describe('formatDate', () => {
  it('formats date in English locale', () => {
    const date = new Date('2025-01-15')
    const result = formatDate(date)
    expect(result).toBe('Jan 15, 2025')
  })

  it('formats different months correctly', () => {
    expect(formatDate(new Date('2025-03-10'))).toBe('Mar 10, 2025')
    expect(formatDate(new Date('2025-06-20'))).toBe('Jun 20, 2025')
    expect(formatDate(new Date('2025-12-25'))).toBe('Dec 25, 2025')
  })

  it('formats single-digit days correctly', () => {
    const result = formatDate(new Date('2025-01-05'))
    expect(result).toBe('Jan 5, 2025')
  })

  it('handles leap year dates', () => {
    const result = formatDate(new Date('2024-02-29'))
    expect(result).toBe('Feb 29, 2024')
  })

  it('handles different years', () => {
    expect(formatDate(new Date('2023-07-15'))).toBe('Jul 15, 2023')
    expect(formatDate(new Date('2024-07-15'))).toBe('Jul 15, 2024')
    expect(formatDate(new Date('2026-07-15'))).toBe('Jul 15, 2026')
  })
})
