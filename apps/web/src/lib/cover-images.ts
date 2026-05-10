import type { ImageMetadata } from 'astro'
import buildingSaasImage from '@/assets/og/building-saas-astro-studiocms.webp'
import gettingStartedAstroImage from '@/assets/og/getting-started-with-astro-5.webp'
import masteringTypescriptImage from '@/assets/og/mastering-typescript-generics.webp'
import setup9routerImage from '@/assets/og/setup-9router-api-proxy-on-vps.webp'
import tailwindMigrationImage from '@/assets/og/tailwindcss-4-migration-guide.webp'

const optimizedCoverImages: Record<string, ImageMetadata> = {
  '/og/building-saas-astro-studiocms.webp': buildingSaasImage,
  '/og/getting-started-with-astro-5.webp': gettingStartedAstroImage,
  '/og/mastering-typescript-generics.webp': masteringTypescriptImage,
  '/og/setup-9router-api-proxy-on-vps.webp': setup9routerImage,
  '/og/tailwindcss-4-migration-guide.webp': tailwindMigrationImage,
}

export const getOptimizedCoverImage = (coverImage: string) => optimizedCoverImages[coverImage]
