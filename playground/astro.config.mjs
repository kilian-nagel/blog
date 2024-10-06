import mdx from '@astrojs/mdx'

// @ts-check
import { defineConfig } from 'astro/config'

import vitesse from 'astro-vitesse'
import UnoCSS from 'unocss/astro'

// https://astro.build/config
export default defineConfig({
  site: 'https://adrianub.dev',
  integrations: [
    mdx(),
    UnoCSS(),
    vitesse({
      title: 'UB',
      credits: true,
      logo: {
        light: '/src/assets/logo-light.svg',
        dark: '/src/assets/logo-dark.svg',
        alt: 'UB Logo',
      },
      defaultLocale: 'root',
      locales: {
        root: {
          lang: 'en',
          label: 'English',
        },
        es: {
          lang: 'es',
          label: 'Español',
        },
      },
      components: {
        Footer: '/src/components/Footer.astro',
      },
      social: {
        twitter: 'https://twitter.com/adrianub',
        github: 'https://github.com/adrian-ub/astro-vitesse',
        mastodon: 'https://mastodon.social/@adrianub',
      },
      navBar: [{
        label: 'Blog',
        slug: 'posts',
      }],
    }),
  ],
  vite: {
    ssr: {
      // This is only necessary when doing integration development.
      external: ['astro-vitesse'],
    },
  },
})
