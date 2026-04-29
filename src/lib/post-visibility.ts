import type { Post } from './cms'

export interface PostQueryOptions {
  includeDrafts?: boolean
  includeNoindex?: boolean
}

export function isPublicPost(post: Post, options: PostQueryOptions = {}): boolean {
  if (!options.includeDrafts && post.data.draft) return false
  if (!options.includeNoindex && post.data.noindex) return false
  return true
}
