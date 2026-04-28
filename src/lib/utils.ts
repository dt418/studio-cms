import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { CollectionEntry } from 'astro:content'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// String Utilities
// ============================================================================

export const getAuthorInitials = (author: string): string =>
  author
    .split(' ')
    .map((name) => name[0])
    .join('')

// ============================================================================
// URL Utilities
// ============================================================================

export const getImageUrl = (image: string | undefined, siteUrl: string): string | undefined =>
  image
    ? image.startsWith('http')
      ? image
      : `${siteUrl}${image.startsWith('/') ? '' : '/'}${image}`
    : undefined

// ============================================================================
// Post Navigation Utilities
// ============================================================================

export const getAdjacentPosts = (
  allPosts: CollectionEntry<'posts'>[],
  currentIndex: number
): {
  prev: CollectionEntry<'posts'> | undefined
  next: CollectionEntry<'posts'> | undefined
} => {
  // Posts are sorted descending by publishedAt (newest first)
  // prev = newer post (index - 1), next = older post (index + 1)
  return {
    prev: currentIndex > 0 ? allPosts[currentIndex - 1] : undefined,
    next:
      currentIndex >= 0 && currentIndex < allPosts.length - 1
        ? allPosts[currentIndex + 1]
        : undefined,
  }
}
