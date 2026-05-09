import { describe, expect, it } from 'vitest'
import rehypeVietnameseSlug, { createSafeSlug, getUniqueId } from '../../rehype-vietnamese-slug.mjs'

describe('Vietnamese heading slugs', () => {
  it('normalizes Vietnamese heading text', () => {
    expect(createSafeSlug('Cài đặt 9Router API Proxy trên VPS')).toBe(
      'cai-dat-9router-api-proxy-tren-vps'
    )
  })

  it('deduplicates normalized heading ids', () => {
    const counts = new Map<string, number>()

    expect(getUniqueId(createSafeSlug('Cài đặt'), counts)).toBe('cai-dat')
    expect(getUniqueId(createSafeSlug('Cài đặt'), counts)).toBe('cai-dat-1')
  })

  it('normalizes rendered heading ids and Astro headings together', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'h2',
          properties: { id: 'cài-đặt' },
          children: [{ type: 'text', value: 'Cài đặt' }],
        },
        {
          type: 'element',
          tagName: 'h2',
          properties: {},
          children: [{ type: 'text', value: 'Cài đặt' }],
        },
      ],
    }
    const file = {
      data: {
        astro: {
          headings: [
            { depth: 2, slug: 'cài-đặt', text: 'Cài đặt' },
            { depth: 2, slug: 'cài-đặt-1', text: 'Cài đặt' },
          ],
        },
      },
    }

    rehypeVietnameseSlug()(tree, file)

    expect(tree.children[0]?.properties.id).toBe('cai-dat')
    expect(tree.children[1]?.properties.id).toBe('cai-dat-1')
    expect(file.data.astro.headings).toEqual([
      { depth: 2, slug: 'cai-dat', text: 'Cài đặt' },
      { depth: 2, slug: 'cai-dat-1', text: 'Cài đặt' },
    ])
  })
})
