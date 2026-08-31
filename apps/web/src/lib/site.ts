export const SITE = {
  name: 'DanhThanh.dev',
  author: 'Danh Thanh',
  description:
    'Thoughts, tutorials, and guides on web development, TypeScript, and modern tooling.',
  email: 'info@danhthanh.dev',
  social: {
    github: 'https://github.com/dt418',
    linkedin: 'https://linkedin.com/in/danhthanh418',
    twitter: '@danhthanh418',
  },
} as const

/** Normalize and validate the single public origin used by generated URLs. */
export function normalizeSiteOrigin(value: string | URL): string {
  const parsed = value instanceof URL ? new URL(value.href) : new URL(value)

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`SITE_URL must use http or https, received ${parsed.protocol}`)
  }
  if (parsed.username || parsed.password) {
    throw new Error('SITE_URL must not contain credentials')
  }
  if (parsed.search || parsed.hash || (parsed.pathname !== '/' && parsed.pathname !== '')) {
    throw new Error('SITE_URL must be an origin with no path, query, or fragment')
  }

  return parsed.origin
}

export function isHttpWithoutCredentialsOrFragment(value: string): boolean {
  try {
    const parsed = new URL(value)
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      !parsed.username &&
      !parsed.password &&
      !parsed.hash
    )
  } catch {
    return false
  }
}

/** The Astro config supplies SITE from SITE_URL/CF_PAGES_URL. */
export function getSiteOrigin(): string {
  const configured =
    import.meta.env.SITE ?? import.meta.env.SITE_URL ?? import.meta.env.CF_PAGES_URL
  if (!configured) {
    throw new Error('SITE_URL or CF_PAGES_URL is required to generate public URLs')
  }
  return normalizeSiteOrigin(configured)
}

export function toAbsoluteUrl(path: string, siteOrigin = getSiteOrigin()): string {
  const origin = normalizeSiteOrigin(siteOrigin)
  return new URL(path, `${origin}/`).href
}

export function toCanonicalUrl(path: string, siteOrigin = getSiteOrigin()): string {
  const origin = normalizeSiteOrigin(siteOrigin)
  const url = new URL(path, `${origin}/`)
  if (url.pathname !== '/' && !url.pathname.endsWith('/')) url.pathname += '/'
  return url.href
}
