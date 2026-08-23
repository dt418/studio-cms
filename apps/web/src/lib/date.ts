const dateOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
} satisfies Intl.DateTimeFormatOptions

export type DateLocale = 'vi' | 'en'

const localeMap: Record<DateLocale, string> = {
  vi: 'vi-VN',
  en: 'en-US',
}

export function formatDate(date: Date, locale: DateLocale = 'en'): string {
  return new Intl.DateTimeFormat(localeMap[locale], dateOptions).format(date)
}
