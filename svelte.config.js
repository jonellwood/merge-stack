import netlify from '@sveltejs/adapter-netlify';
import staticAdapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const capacitorBuild = process.env.CAPACITOR_BUILD === 'true';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: capacitorBuild
      ? staticAdapter({ pages: 'build', assets: 'build', fallback: 'index.html' })
      : netlify()
  }
};
