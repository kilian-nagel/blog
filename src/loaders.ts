import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { glob, type Loader, type LoaderContext } from 'astro/loaders'
import { PostsSchemas } from 'astro-vitesse/schemas/post'
import { ProjectsSchemas } from 'astro-vitesse/schemas/project'

// eslint-disable-next-line unused-imports/no-unused-vars
const collectionNames = ['pages', 'i18n'] as const
type VitesseCollection = (typeof collectionNames)[number]

// https://github.com/withastro/astro/blob/main/packages/astro/src/core/constants.ts#L87
// https://github.com/withastro/astro/blob/main/packages/integrations/mdx/src/index.ts#L59
const pagesExtensions = [
  'markdown',
  'mdown',
  'mkdn',
  'mkd',
  'mdwn',
  'md',
  'mdx',
]
const i18nExtensions = ['json', 'yml', 'yaml']

const query_projects = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
    {
      projects {
        id
        title
        dates
        excerpt
        slug
        content {
            html 
        }
        isCompleted
      }
    }`,
  }),
}

const query_posts = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
    {
      posts {
        id
        title
        dates
        excerpt
        slug
        content {
            html 
        }
      }
    }`,
  }),
}

export function pagesLoader(): Loader {
  return {
    name: 'vitesse-pages-loader',
    load: createGlobLoadFn('pages'),
  }
}

export function i18nLoader(): Loader {
  return {
    name: 'vitesse-i18n-loader',
    load: createGlobLoadFn('i18n'),
  }
}

export function ProjectsLoader(): Loader {
  return {
    name: 'projects-loader',
    load: async () => {
      const response = await fetch(
        import.meta.env.VITE_HYGRAPH_ENDPOINT,
        query_projects,
      )
      const projects_raw = await response.json()
      const projects = projects_raw?.data?.projects
      const projects_validated = ProjectsSchemas().safeParse(projects)

      if (projects_validated.success) {
        return projects_validated.data
      }
      else {
        throw new Error(projects_validated.error)
      }
    },
  }
}

export function PostsLoader(): Loader {
  return {
    name: 'posts-loader',
    load: async () => {
      const response = await fetch(
        import.meta.env.VITE_HYGRAPH_ENDPOINT,
        query_posts,
      )
      const posts_raw = await response.json()
      const posts = posts_raw?.data?.posts
      const posts_validated = PostsSchemas().safeParse(posts)

      if (posts_validated.success) {
        return posts_validated.data
      }
      else {
        throw new Error(posts_validated.error)
      }
    },
  }
}

function createGlobLoadFn(collection: VitesseCollection): Loader['load'] {
  return (context: LoaderContext) => {
    const extensions
      = collection === 'pages' ? pagesExtensions : i18nExtensions

    if (
      collection === 'pages'
      && context.config.integrations.find(
        ({ name }) => name === '@astrojs/markdoc',
      )
    ) {
      // https://github.com/withastro/astro/blob/main/packages/integrations/markdoc/src/content-entry-type.ts#L28
      extensions.push('mdoc')
    }

    return glob({
      base: getCollectionPathFromRoot(collection, context.config),
      pattern: `**/[^_]*.{${extensions.join(',')}}`,
    }).load(context)
  }
}

/**
 * We still rely on the content folder structure to be fixed for now:
 *
 * - At build time, if the feature is enabled, we get all the last commit dates for each file in
 *   the docs folder ahead of time. In the current approach, we cannot know at this time the
 *   user-defined content folder path in the integration context as this would only be available
 *   from the loader. A potential solution could be to do that from a custom loader re-implementing
 *   the glob loader or built on top of it. Although, we don't have access to the Vitesse
 *   configuration from the loader to even know we should do that.
 * - Remark plugins get passed down an absolute path to a content file and we need to figure out
 *   the language from that path. Without knowing the content folder path, we cannot reliably do
 *   so.
 *
 * Below are various functions to easily get paths to these collections and avoid having to
 * hardcode them throughout the codebase. When user-defined content folder locations are supported,
 * these helper functions should be updated to reflect that in one place.
 */

export function getCollectionPath(
  collection: VitesseCollection,
  srcDir: URL,
): string {
  return new URL(`content/${collection}/`, srcDir).pathname
}

export function resolveCollectionPath(
  collection: VitesseCollection,
  srcDir: URL,
): string {
  return resolve(fileURLToPath(srcDir), `content/${collection}`)
}

export function getCollectionPathFromRoot(
  collection: VitesseCollection,
  { root, srcDir }: { root: URL | string, srcDir: URL | string },
): string {
  return `${(typeof srcDir === 'string' ? srcDir : srcDir.pathname).replace(
    typeof root === 'string' ? root : root.pathname,
    '',
  )}content/${collection}`
}
