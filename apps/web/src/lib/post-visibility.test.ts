import { describe, expect, it } from 'vitest'
import { makePost } from '../test-helpers'
import { isPublicPost, isRoutablePost, validateTranslationKeys } from './post-visibility'

describe('post visibility predicates', () => {
  it('allows noindex content to have a route while drafts remain unroutable', () => {
    expect(isRoutablePost(makePost({ noindex: true }))).toBe(true)
    expect(isRoutablePost(makePost({ draft: true }))).toBe(false)
    expect(isPublicPost(makePost({ noindex: true }))).toBe(false)
    expect(isPublicPost(makePost())).toBe(true)
  })

  it('rejects duplicate translation identities in one locale', () => {
    const duplicatePosts = [
      makePost({ slug: 'one', language: 'en', translationKey: 'hello' }),
      makePost({ slug: 'two', language: 'en', translationKey: 'hello' }),
    ]
    expect(() => validateTranslationKeys(duplicatePosts)).toThrow(
      'Duplicate translationKey "hello" for locale "en"'
    )
  })

  it('allows the same translation key once per locale', () => {
    expect(() =>
      validateTranslationKeys([
        makePost({ slug: 'vi-post', language: 'vi', translationKey: 'hello' }),
        makePost({ slug: 'en-post', language: 'en', translationKey: 'hello' }),
      ])
    ).not.toThrow()
  })
})
