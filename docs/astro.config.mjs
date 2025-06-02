// @ts-check
import { defineConfig } from 'astro/config'

import vitesse from 'astro-vitesse'
import UnoCSS from 'unocss/astro'

// https://astro.build/config
export default defineConfig({
  site: 'https://astro-vitesse.vercel.app',
  integrations: [
    UnoCSS(),
    vitesse({
      title: 'Astro Vitesse',
      credits: true,
      logo: {
        light: '/src/assets/logo-light.svg',
        dark: '/src/assets/logo-dark.svg',
        alt: 'Astro Vitesse Logo',
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
        github: 'https://github.com/kilian-nagel',
      },
      navBar: [
        {
          label: 'Blog',
          slug: 'posts',
          icon: 'i-ri-article-line',
          labelClass: 'lt-md:hidden',
          iconClass: 'md:hidden',
          translations: {
            es: 'Publicaciones',
          },
        },
        {
          label: 'Projects',
          slug: 'projects',
          icon: 'i-ri-lightbulb-line',
          labelClass: 'lt-md:hidden',
          iconClass: 'md:hidden',
        },
        {
          label: 'GitHub',
          link: 'https://github.com/kilian-nagel',
          hideLabel: true,
          icon: 'i-uil-github-alt',
          wrapperClass: 'lt-md:hidden',
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        },
      ],
      subNavBar: [
        {
          label: 'Blog',
          slug: 'posts',
        },
        {
          label: 'Notes',
          slug: 'notes',
        },
      ],
    }),
  ],
})
