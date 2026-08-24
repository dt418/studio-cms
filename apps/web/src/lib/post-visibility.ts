import type { Post } from './content-queries'
import { getPostLocale } from './content-utils'

export interface PostQueryOptions {
  includeDrafts?: boolean
  includeNoindex?: boolean
}

export function isPublicPost(post: Post, options: PostQueryOptions = {}): boolean {
  if (!options.includeDrafts && post.data.draft) return false
  if (!options.includeNoindex && post.data.noindex) return false
  return true
}

/** A draft can be rendered only when an explicit route asks for it. */
export function isRoutablePost(post: Post): boolean {
  return !post.data.draft
}

/** Indexable content is the default visibility contract for discovery surfaces. */
export function isIndexablePost(post: Post): boolean {
  return isPublicPost(post)
}

export function validateTranslationKeys(posts: Post[]): void {
  // Validate every collection entry, including drafts/noindex posts, so publishing
  // a hidden translation later cannot introduce an ambiguous locale identity.
  const seen = new Set<string>()
  for (const post of posts) {
    const translationKey = post.data.translationKey
    if (!translationKey) continue
    const locale = getPostLocale(post)
    const identity = `${locale}:${translationKey}`
    if (seen.has(identity)) {
      throw new Error(`Duplicate translationKey "${translationKey}" for locale "${locale}"`)
    }
    seen.add(identity)
  }
}

export const isRouteEligiblePost = isRoutablePost
export const assertUniqueTranslationKeys = validateTranslationKeys
