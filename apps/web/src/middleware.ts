// src/middleware.ts
import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()

  if (response.status === 404) {
    const locale = context.currentLocale ?? 'vi'
    const notFoundResponse = await context.rewrite(`/${locale}/404`)

    return new Response(notFoundResponse.body, {
      headers: notFoundResponse.headers,
      status: 404,
      statusText: 'Not Found',
    })
  }

  return response
})
