import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import studioCMS from 'studiocms';

import studiocmsUi from '@studiocms/ui';
import { langFlags } from './src/lang-flags-icons.js';

import tailwindcss from '@tailwindcss/vite';

import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import rehypePrettyCode from 'rehype-pretty-code';

import studiocmsCfetch from '@studiocms/cfetch';
import astroExpressiveCode from 'astro-expressive-code'
import ecTwoSlash from "expressive-code-twoslash";

// https://astro.build/config
export default defineConfig({
	site: process.env["NODE_ENV"] === 'production' ? process.env["SITE_URL"] : 'http://localhost:4321',
	output: 'server',

	adapter: node({
		mode: 'standalone',
	}),

	security: {
		checkOrigin: false, // This depends on your hosting provider
	},

	integrations: [
		studioCMS(),
		studiocmsUi({
			icons: {
				'lang-flags': langFlags,
			},
		}),
		studiocmsCfetch(),
		astroExpressiveCode({
			plugins: [ecTwoSlash()],
		})],

	vite: {
		plugins: [tailwindcss()],
	},
	markdown: {
		remarkPlugins: [remarkGfm],
		rehypePlugins: [
			rehypeSlug,
			[rehypeAutolinkHeadings, { behavior: 'wrap' }],
			rehypePrettyCode
		],
	},
});