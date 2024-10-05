import type { AstroIntegration } from 'astro'

export default function AntfuMeIntegration(): AstroIntegration {
  return {
    name: 'astro-vitesse',
    hooks: {
      'astro:config:setup': async ({ injectRoute, updateConfig }) => {
        injectRoute({
          pattern: '[...page]',
          entrypoint: 'astro-vitesse/routes/[...page].astro',
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
