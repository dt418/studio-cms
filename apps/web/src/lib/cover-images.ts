import type { ImageMetadata } from 'astro'
import buildingSaasImage from '@/assets/og/building-saas-astro-studiocms.webp'
import gettingStartedAstroImage from '@/assets/og/getting-started-with-astro-5.webp'
import masteringTypescriptImage from '@/assets/og/mastering-typescript-generics.webp'
import setup9routerImage from '@/assets/og/setup-9router-api-proxy-on-vps.webp'
import tailwindMigrationImage from '@/assets/og/tailwindcss-4-migration-guide.webp'

export type VerifiedCoverImage = ImageMetadata & { format: 'png' | 'webp' }

const optimizedCoverImages: Record<string, ImageMetadata> = {
  '/og/building-saas-astro-studiocms.webp': buildingSaasImage,
  '/og/getting-started-with-astro-5.webp': gettingStartedAstroImage,
  '/og/mastering-typescript-generics.webp': masteringTypescriptImage,
  '/og/setup-9router-api-proxy-on-vps.webp': setup9routerImage,
  '/og/tailwindcss-4-migration-guide.webp': tailwindMigrationImage,
}

/**
 * Only local assets with an image format and intrinsic dimensions we can verify
 * are eligible for SEO/social metadata. Unknown frontmatter paths intentionally
 * fall back to the generated site image instead of receiving guessed dimensions.
 */
export function isVerifiedCoverImage(
  image: ImageMetadata | undefined
): image is VerifiedCoverImage {
  return Boolean(
    image &&
    (image.format === 'png' || image.format === 'webp') &&
    image.src.trim() &&
    Number.isInteger(image.width) &&
    image.width > 0 &&
    Number.isInteger(image.height) &&
    image.height > 0
  )
}

export function getOptimizedCoverImage(coverImage: string): VerifiedCoverImage | undefined {
  const image = optimizedCoverImages[coverImage]
  return isVerifiedCoverImage(image) ? image : undefined
}
