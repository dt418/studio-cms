import type { APIRoute } from 'astro'
import { getAllPosts } from '@/lib/content-queries'
import { buildSitemapManifest, serializeSitemap } from '@/lib/sitemap-manifest'
import { getSiteOrigin } from '@/lib/site'

export const prerender = true

export const GET: APIRoute = async () => {
  const origin = getSiteOrigin()
  const records = buildSitemapManifest(await getAllPosts(), origin)
  return new Response(serializeSitemap(records), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
