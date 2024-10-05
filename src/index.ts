import type { AstroIntegration } from 'astro'

import remarkGithubAlerts from 'remark-github-alerts'

export default function VitesseIntegration(): AstroIntegration {
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
            remarkPlugins: [remarkGithubAlerts],
          },
        })
      },
    },
  }
}
