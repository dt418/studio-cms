import type { CollectionEntry } from 'astro:content'

export type Post = CollectionEntry<'posts'>

export function makePost(overrides: Partial<Post['data']> & { body?: string } = {}): Post {
  const slug = overrides.slug ?? 'test'
  return {
    id: `${slug}.md`,
    collection: 'posts',
    data: {
      title: overrides.title ?? 'Test Post',
      slug,
      excerpt: overrides.excerpt ?? 'A test post excerpt',
      publishedAt: overrides.publishedAt ?? new Date('2025-01-01'),
      category: overrides.category ?? 'tutorials',
      tags: overrides.tags ?? [],
      author: overrides.author ?? 'Danh Thanh',
      coverImage: overrides.coverImage,
      updatedAt: overrides.updatedAt,
      authorAvatar: overrides.authorAvatar,
    },
    body: overrides.body ?? 'Test post body content here',
  } as Post
}
