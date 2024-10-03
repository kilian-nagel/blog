// @ts-check
import { defineConfig } from 'astro/config'

import AntfuMeIntegration from 'astro-antfu.me'

// https://astro.build/config
export default defineConfig({
  integrations: [AntfuMeIntegration()],
})
