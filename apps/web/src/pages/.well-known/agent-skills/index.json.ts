import type { APIRoute } from 'astro'
import { getAgentSkills } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = () => {
  const skills = getAgentSkills()
  const payload = { skills }
  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  })
}
