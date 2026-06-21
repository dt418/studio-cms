import type { APIRoute } from 'astro'
import { getDnsAidRecords, getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? getSiteUrl()).origin
  const payload = {
    $schema: 'https://github.com/agentdiscovery/dns-aid/raw/main/spec/dns-aid.schema.json',
    origin,
    version: '0.1',
    records: getDnsAidRecords(),
    notes:
      'DNS-AID (Agent Discovery via DNS) publishes agent endpoints through SVCB/HTTPS resource records. Operators should mirror the records above at the apex zone to make agents discoverable via DNS.',
  }
  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  })
}
