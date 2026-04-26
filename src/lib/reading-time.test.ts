import { describe, it, expect } from 'vitest'
import { readingTime } from './reading-time'

describe('readingTime', () => {
  it('returns 1 minute for empty text', () => {
    expect(readingTime('')).toBe(1)
    expect(readingTime('   ')).toBe(1)
  })

  it('returns 1 minute for short text (< 200 words)', () => {
    const text = 'word '.repeat(100).trim()
    expect(readingTime(text)).toBe(1)
  })

  it('calculates reading time at 200 words per minute', () => {
    const text = 'word '.repeat(200).trim()
    expect(readingTime(text)).toBe(1)
  })

  it('returns 2 minutes for 400 words', () => {
    const text = 'word '.repeat(400).trim()
    expect(readingTime(text)).toBe(2)
  })

  it('rounds up partial minutes', () => {
    const text = 'word '.repeat(250).trim()
    expect(readingTime(text)).toBe(2)
  })

  it('handles text with multiple spaces', () => {
    const text = 'word    word     word'
    expect(readingTime(text)).toBe(1)
  })

  it('handles text with newlines', () => {
    const text = 'word\nword\nword'
    expect(readingTime(text)).toBe(1)
  })

  it('calculates correctly for long articles', () => {
    const text = 'word '.repeat(1000).trim()
    expect(readingTime(text)).toBe(5)
  })

  it('ignores extra whitespace', () => {
    const text = '  word   word  word  '
    expect(readingTime(text)).toBe(1)
  })
})
