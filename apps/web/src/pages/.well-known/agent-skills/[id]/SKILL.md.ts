import type { APIRoute } from 'astro'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const prerender = true

export async function getStaticPaths() {
  return [{ params: { id: 'read-blog' } }]
}

function resolveSkillPath(id: string): string {
  return join(process.cwd(), 'agent-skills', id, 'SKILL.md')
}

export const GET: APIRoute = ({ params }) => {
  const id = params.id ?? 'read-blog'
  const sourcePath = resolveSkillPath(id)
  let body: string
  try {
    body = readFileSync(sourcePath, 'utf8')
  } catch {
    return new Response('# Not found\n', {
      status: 404,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    })
  }
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
