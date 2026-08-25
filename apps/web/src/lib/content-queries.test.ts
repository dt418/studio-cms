import { describe, expect, it } from 'vitest'
import { isPublicPost } from './post-visibility'
import { makePost } from '../test-helpers'

describe('isPublicPost', () => {
  it('includes normal published posts by default', () => {
    expect(isPublicPost(makePost())).toBe(true)
  })

  it('excludes drafts by default', () => {
    expect(isPublicPost(makePost({ draft: true }))).toBe(false)
  })

  it('excludes noindex posts by default', () => {
    expect(isPublicPost(makePost({ noindex: true }))).toBe(false)
  })

  it('can include drafts and noindex posts for explicit route generation', () => {
    const draftPost = makePost({ draft: true })
    const noindexPost = makePost({ noindex: true })

    expect(isPublicPost(draftPost, { includeDrafts: true })).toBe(true)
    expect(isPublicPost(noindexPost, { includeNoindex: true })).toBe(true)
  })
})
