// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// GitHub Pages serves this repo at https://asyrafmika.github.io/StudyPack/
// so every internal link must be prefixed with `base` (see src/lib/url.ts).
export default defineConfig({
  site: 'https://asyrafmika.github.io',
  base: '/StudyPack',
  trailingSlash: 'always',
  integrations: [mdx()],
  markdown: {
    syntaxHighlight: {
      type: 'shiki',
      // ```mermaid blocks are left as plain text and rendered in the browser
      excludeLangs: ['mermaid', 'math'],
    },
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
