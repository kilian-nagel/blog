/* eslint-disable ts/ban-ts-comment */
import { OGImageRoute } from 'astro-og-canvas'

// @ts-ignore
import { paths } from 'node_modules/astro-vitesse/src/utils/routing'

const pages = Object.fromEntries(paths.map(({ params: {
  // @ts-ignore
  slug,
}, props: {
  // @ts-ignore
  entry,
} }) => {
  return [!slug ? 'index' : slug, entry?.data]
}))

export const { getStaticPaths, GET } = OGImageRoute({
  // Pass down the documentation pages.
  pages,
  // Define the name of the parameter used in the endpoint path, here `slug`
  // as the file is named `[...slug].ts`.
  param: 'slug',
  // Define a function called for each page to customize the generated image.
  getImageOptions: (_path, page: (typeof pages)[number]) => {
    return {
      // Use the page title and description as the image title and description.
      title: page.title,
      description: page.description,
      // Customize various colors and add a border.
      bgGradient: [[24, 24, 27]],
      border: { color: [63, 63, 70], width: 20 },
      padding: 120,
    }
  },
})
