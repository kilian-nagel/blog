import type { AstroIntegration } from 'astro'

export default function AntfuMeIntegration(): AstroIntegration {
  return {
    name: 'astro-antfu.me',
    hooks: {
      'astro:config:setup': async ({ injectRoute, updateConfig }) => {
        injectRoute({
          pattern: '/[...page]',
          entrypoint: 'astro-antfu.me/routes/[...page].astro',
        })

        updateConfig({
          markdown: {
            shikiConfig: {
              themes: {
                dark: 'vitesse-dark',
                light: 'vitesse-light',
              },
              defaultColor: false,
              wrap: true,
            },
          },
        })
      },
    },
  }
}
