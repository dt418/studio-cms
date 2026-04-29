import { SITE } from './site'

export interface SEOProps {
  title: string
  description: string
  image?: string
  canonicalUrl?: string
}

interface SEOConfig {
  siteName: string
  defaultImage: string
  twitterHandle: string
}

const config: SEOConfig = {
  siteName: SITE.name,
  defaultImage: '/og-image.png',
  twitterHandle: SITE.social.twitter,
}

export function generateSEO({
  title,
  description,
  image,
  canonicalUrl,
}: SEOProps): Record<string, string> {
  const fullTitle = `${title} | ${config.siteName}`
  const ogImage = image ?? config.defaultImage

  return {
    title: fullTitle,
    description,
    'og:title': fullTitle,
    'og:description': description,
    'og:image': ogImage,
    'og:type': 'article',
    'twitter:card': 'summary_large_image',
    'twitter:title': fullTitle,
    'twitter:description': description,
    'twitter:image': ogImage,
    'twitter:site': config.twitterHandle,
    ...(canonicalUrl ? { 'og:url': canonicalUrl, canonical: canonicalUrl } : {}),
  }
}
