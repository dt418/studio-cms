import blog from '@studiocms/blog';
import md from '@studiocms/md';
import html from '@studiocms/html';

import { defineStudioCMSConfig } from 'studiocms/config';

import markdoc from '@studiocms/markdoc';

import wysiwyg from '@studiocms/wysiwyg';

import mdx from '@studiocms/mdx';

export default defineStudioCMSConfig({
    dbStartPage: false,
    dialect:'libsql',
    plugins: [md(), blog(), html(), markdoc(), wysiwyg(), mdx()],
});