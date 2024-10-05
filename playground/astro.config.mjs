import mdx from '@astrojs/mdx'

// @ts-check
import { defineConfig } from 'astro/config'
import AntfuMeIntegration from 'astro-vitesse'

import UnoCSS from 'unocss/astro'

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), AntfuMeIntegration(), UnoCSS()],
  vite: {
    ssr: {
      external: ['astro-vitesse'],
    },
  },
})
