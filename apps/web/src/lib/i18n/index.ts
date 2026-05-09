import { en } from './en'
import { vi } from './vi'

export type Language = 'vi' | 'en'

export const DEFAULT_LOCALE: Language = 'vi'

export type Translations = typeof en

const translations: Record<Language, Translations> = { vi, en }

export function getTranslations(lang: Language): Translations {
  return translations[lang]
}
