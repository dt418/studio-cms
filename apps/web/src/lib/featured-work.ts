const FEATURED_WORD_PATTERN = /[\p{L}\p{N}]+/gu

export function getFeaturedMark(title: string): string {
  return (
    title
      .match(FEATURED_WORD_PATTERN)
      ?.slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase() ?? ''
  )
}
