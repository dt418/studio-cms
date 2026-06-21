import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      'astro:content': new URL('./src/__mocks__/astro-content.ts', import.meta.url).pathname,
    },
  },
  define: {
    'import.meta.env.SITE': JSON.stringify('http://localhost:4321'),
  },
  test: {
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
