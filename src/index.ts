import type { AstroIntegration } from 'astro'

export default function AntfuMeIntegration(): AstroIntegration {
  return {
    name: 'astro-antfu.me',
    hooks: {
      'astro:config:setup': async ({ injectRoute }) => {
        injectRoute({
          pattern: '/',
          entrypoint: 'astro-antfu.me/routes/Index.astro',
        })
      },
    },
  }
}
