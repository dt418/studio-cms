import type { APIRoute } from 'astro'
import { getTranslations } from '@/lib/i18n'
import { SITE } from '@/lib/site'
import { getSiteOrigin } from '@/lib/site'
import { isValidLocale } from '@/lib/content-utils'

export const prerender = true

export async function getStaticPaths() {
  return [{ params: { lang: 'vi' } }, { params: { lang: 'en' } }]
}

export const GET: APIRoute = ({ params }) => {
  const langParam = params.lang ?? 'vi'
  const lang = isValidLocale(langParam) ? langParam : 'vi'
  const origin = getSiteOrigin()
  const i18n = getTranslations(lang)
  const title = lang === 'vi' ? 'Về tôi' : 'About'
  const contact = lang === 'vi' ? 'Liên hệ hợp tác' : 'Contact for collaboration'

  const body = [
    `# ${title}`,
    '',
    '## Author',
    '',
    SITE.author,
    '',
    '## Bio',
    '',
    i18n.footer.softwareEngineer,
    '',
    i18n.hero.description,
    '',
    '## Contact',
    '',
    `- Email: ${SITE.email}`,
    `- GitHub: ${SITE.social.github}`,
    `- LinkedIn: ${SITE.social.linkedin}`,
    `- Twitter: ${SITE.social.twitter}`,
    '',
    `[${contact}](mailto:${SITE.email})`,
    '',
    `Source: <${origin}/${lang}/about>`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
