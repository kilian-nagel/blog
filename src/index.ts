/**
 * These triple-slash directives defines dependencies to various declaration files that will be
 * loaded when a user imports the Starlight integration in their Astro configuration file. These
 * directives must be first at the top of the file and can only be preceded by this comment.
 */
/// <reference path="./locals.d.ts" />
/// <reference path="./i18n.d.ts" />

import type { AstroIntegration } from 'astro'
import type { PluginTranslations, VitesseUserConfigWithPlugins } from './utils/plugins'

import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import rehypeToc from '@microflash/rehype-toc'
import { h } from 'hastscript'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

import { vitesseSitemap } from './integrations/sitemap'
import { vitePluginVitesseUserConfig } from './integrations/virtual-user-config'
import { processI18nConfig } from './utils/i18n'
import { injectPluginTranslationsTypes, runPlugins } from './utils/plugins'
import { createTranslationSystemFromFs } from './utils/translations-fs'

export default function VitesseIntegration({
  plugins,
  ...opts
}: VitesseUserConfigWithPlugins): AstroIntegration {
  let pluginTranslations: PluginTranslations = {}
  return {
    name: 'astro-vitesse',
    hooks: {
      'astro:config:setup': async ({ injectRoute, updateConfig, config, command, isRestart, logger, addMiddleware }) => {
        const pluginResult = await runPlugins(opts, plugins, {
          command,
          config,
          isRestart,
          logger,
        })

        // Process the Astro and Vitesse configurations for i18n and translations.
        const { vitesseConfig, astroI18nConfig } = processI18nConfig(
          pluginResult.vitesseConfig,
          config.i18n,
        )

        const integrations = pluginResult.integrations
        pluginTranslations = pluginResult.pluginTranslations

        // TODO: is required to use translations in the future
        // eslint-disable-next-line unused-imports/no-unused-vars
        const useTranslations = createTranslationSystemFromFs(
          vitesseConfig,
          config,
          pluginTranslations,
        )

        addMiddleware({ entrypoint: 'astro-vitesse/locals', order: 'pre' })

        if (!vitesseConfig.disable404Route) {
          injectRoute({
            pattern: '404',
            entrypoint: vitesseConfig.prerender
              ? 'astro-vitesse/routes/static/404.astro'
              : 'astro-vitesse/routes/ssr/404.astro',
            prerender: vitesseConfig.prerender,
          })
        }

        injectRoute({
          pattern: '[...slug]',
          entrypoint: vitesseConfig.prerender
            ? 'astro-vitesse/routes/static/index.astro'
            : 'astro-vitesse/routes/ssr/index.astro',
          prerender: vitesseConfig.prerender,
        })

        // Add built-in integrations only if they are not already added by the user through the
        // config or by a plugin.
        const allIntegrations = [...config.integrations, ...integrations]
        if (!allIntegrations.find(({ name }) => name === '@astrojs/sitemap')) {
          integrations.push(vitesseSitemap(vitesseConfig))
        }
        if (!allIntegrations.find(({ name }) => name === '@astrojs/mdx')) {
          integrations.push(mdx({ optimize: true }))
        }

        // Add integrations immediately after Starlight in the config array.
        // e.g. if a user has `integrations: [starlight(), tailwind()]`, then the order will be
        // `[starlight(), expressiveCode(), sitemap(), mdx(), tailwind()]`.
        // This ensures users can add integrations before/after Starlight and we respect that order.
        const selfIndex = config.integrations.findIndex(i => i.name === 'astro-vitesse')
        config.integrations.splice(selfIndex + 1, 0, ...integrations)

        updateConfig({
          vite: {
            plugins: [
              vitePluginVitesseUserConfig(vitesseConfig, config, pluginTranslations),
            ],
          },
          markdown: {
            rehypePlugins: [
              rehypeHeadingIds,
              [
                rehypeToc,
                {
                  toc: (headings: { id: string, title: string, depth: number }[]) => {
                    return h('section', [
                      h('div.table-of-contents', [
                        h('div.table-of-contents-anchor', [
                          h('div.i-ri-menu-2-fill'),
                        ]),
                        h('ul', [
                          ...headings.map(heading => h(`li`, [
                            h('a', { href: `#${heading.id}` }, heading.title),
                          ])),
                        ]),
                      ]),
                    ])
                  },
                },
              ],
              [
                rehypeAutolinkHeadings,
                {
                  behavior: 'append',
                  content: {
                    type: 'text',
                    value: '#',
                  },
                  properties: {
                    ariaHidden: true,
                    tabIndex: -1,
                    className: 'header-anchor',
                  },
                },
              ],
            ],
            shikiConfig: {
              themes: {
                dark: 'vitesse-dark',
                light: 'vitesse-light',
              },
              defaultColor: false,
              wrap: true,
            },
          },
          scopedStyleStrategy: 'where',
          // If not already configured, default to prefetching all links on hover.
          prefetch: config.prefetch ?? { prefetchAll: true },
          experimental: {
            globalRoutePriority: true,
          },
          i18n: astroI18nConfig,
        })
      },
      'astro:config:done': ({ injectTypes }) => {
        injectPluginTranslationsTypes(pluginTranslations, injectTypes)
      },
    },
  }
}
