import { defineConfig } from 'astro/config';

// Deployed to GitHub Pages, served at the custom domain luluzhao.com.
// Because the custom domain serves at its root, no `base` path is needed.

export default defineConfig({
  site: 'https://luluzhao.com',
  trailingSlash: 'ignore',
});
