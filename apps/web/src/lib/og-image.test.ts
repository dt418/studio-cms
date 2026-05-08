import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'

vi.mock('./post', () => ({ getImageUrl: vi.fn() }))

import { getImageUrl } from './post'
const mockGetImageUrl = vi.mocked(getImageUrl)
import { resolveOgImage } from './og-image'

const siteUrl = 'https://example.com'
const defaultImage = 'https://example.com/og-image.png'

const tempFile = '.og-image-test-temp.png'

beforeAll(() => {
  mkdirSync('public', { recursive: true })
  writeFileSync(`public/${tempFile}`, '')
})

afterAll(() => {
  rmSync(`public/${tempFile}`, { force: true })
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('resolveOgImage', () => {
  it('returns defaultImage when img is undefined', () => {
    expect(resolveOgImage(undefined, siteUrl, defaultImage)).toBe(defaultImage)
  })

  it('returns defaultImage when img is empty string', () => {
    expect(resolveOgImage('', siteUrl, defaultImage)).toBe(defaultImage)
  })

  it('returns defaultImage when getImageUrl returns undefined', () => {
    mockGetImageUrl.mockReturnValue(undefined)
    expect(resolveOgImage('/cover.png', siteUrl, defaultImage)).toBe(defaultImage)
  })

  it('skips filesystem check for remote URLs', () => {
    mockGetImageUrl.mockReturnValue('https://cdn.example.com/photo.jpg')
    expect(resolveOgImage('https://cdn.example.com/photo.jpg', siteUrl, defaultImage)).toBe(
      'https://cdn.example.com/photo.jpg'
    )
  })

  it('returns resolvedUrl when local file exists', () => {
    const resolvedUrl = `${siteUrl}/${tempFile}`
    mockGetImageUrl.mockReturnValue(resolvedUrl)

    expect(resolveOgImage(`/${tempFile}`, siteUrl, defaultImage)).toBe(resolvedUrl)
  })

  it('falls back to defaultImage when local file is missing', () => {
    mockGetImageUrl.mockReturnValue('https://example.com/nonexistent.png')

    expect(resolveOgImage('/nonexistent.png', siteUrl, defaultImage)).toBe(defaultImage)
  })
})
