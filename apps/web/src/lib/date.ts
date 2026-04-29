const dateOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
} satisfies Intl.DateTimeFormatOptions

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', dateOptions).format(date)
}
