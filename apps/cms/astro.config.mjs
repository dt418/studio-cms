import node from '@astrojs/node';
import { defineConfig } from 'astro/config';
import studioCMS from 'studiocms';

export default defineConfig({
  site: process.env.CMS_SITE_URL || 'http://localhost:4322',

  output: 'server',

  adapter: node({
    mode: 'standalone',
  }),

  vite: {
    build: {
      target: 'esnext', // 🔥 fix top-level await
    },

    optimizeDeps: {
      exclude: [
        'studiocms',
        '@studiocms/blog',
      ],
    },

    ssr: {
      noExternal: [
        'studiocms',
        '@studiocms/blog',
      ],
    },
  },

  security: {
    checkOrigin: false,
  },

  integrations: [
    studioCMS(),
  ],
});
