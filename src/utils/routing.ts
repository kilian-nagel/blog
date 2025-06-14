import type { GetStaticPathsItem } from 'astro'
import { type CollectionEntry, getCollection } from 'astro:content'

import project from 'virtual:vitesse/project-context'
import config from 'virtual:vitesse/user-config'
import { getCollectionPathFromRoot, PostsLoader } from '../loaders'
import { BuiltInDefaultLocale } from './i18n'
import {
  type LocaleData,
  localizedId,
  localizedSlug,
  slugToLocaleData,
  slugToParam,
} from './slugs'
import { validateLogoImports } from './validate-logo-imports'

// Validate any user-provided logos imported correctly.
// We do this here so all pages trigger it and at the top level so it runs just once.
validateLogoImports()

// The type returned from `CollectionEntry` is different for legacy collections and collections
// using a loader. This type is a common subset of both types.
export type VitessePagesCollectionEntry = Omit<
  CollectionEntry<'pages'>,
  'id' | 'filePath' | 'render' | 'slug'
> & {
  // Update the `id` property to be a string like in the loader type.
  id: string
  // Add the `filePath` property which is only present in the loader type.
  filePath?: string
  // Add the `slug` property which is only present in the legacy type.
  slug?: string
}

export type VitessePagesEntry = VitessePagesCollectionEntry & {
  filePath: string
  slug: string
}

export interface Route extends LocaleData {
  /** Content collection entry for the current page. Includes frontmatter at `data`. */
  entry: VitessePagesEntry
  /** Locale metadata for the page content. Can be different from top-level locale values when a page is using fallback content. */
  entryMeta: LocaleData
  /** The slug, a.k.a. permalink, for this page. */
  slug: string
  /** The slug or unique ID if using the `legacy.collections` flag. */
  id: string
  /** True if this page is untranslated in the current language and using fallback content from the default locale. */
  isFallback?: true
  [key: string]: unknown
}

interface Path extends GetStaticPathsItem {
  params: { slug: string | undefined }
  props: Route
}

/**
 * Astro is inconsistent in its `index.md` slug generation. In most cases,
 * `index` is stripped, but in the root of a collection, we get a slug of `index`.
 * We map that to an empty string for consistent behaviour.
 */
function normalizeIndexSlug(slug: string): string {
  return slug === 'index' ? '' : slug
}

/** Normalize the different collection entry we can get from a legacy collection or a loader. */
export function normalizeCollectionEntry(
  entry: VitessePagesCollectionEntry,
): VitessePagesEntry {
  return {
    ...entry,
    // In a legacy collection, the `filePath` property doesn't exist.
    filePath:
      entry.filePath
      ?? `${getCollectionPathFromRoot('pages', project)}/${entry.id}`,
    // In a collection with a loader, the `slug` property is replaced by the `id`.
    slug: normalizeIndexSlug(entry.slug ?? entry.id),
  }
}

/** All entries in the pages content collection. */
const pages: VitessePagesEntry[] = (
  (await getCollection('pages', ({ data }): boolean => {
    // In production, filter out drafts.
    return import.meta.env.MODE !== 'production' || data.draft === false
  }).then(async (data) => {
    const post_entries = await PostsLoader().load()
    const page_posts_data = []

    // Build page entries from posts data.
    for (const post of post_entries) {
      const page_post = {
        id: `posts/${post.id}`,
        data: {
          title: post?.title,
          date: post?.dates,
          draft: false,
        },
        body: post?.content?.html,
        collection: 'hygraph',
      }
      page_posts_data.push(page_post)
    }
    return data.concat(page_posts_data)
  })) ?? []
).map(normalizeCollectionEntry)

function getRoutes(): Route[] {
  const routes: Route[] = pages.map(entry => ({
    entry,
    slug: entry.slug,
    id: entry.id,
    entryMeta: slugToLocaleData(entry.slug),
    ...slugToLocaleData(entry.slug),
  }))

  // In multilingual sites, add required fallback routes.
  if (config.isMultilingual) {
    /** Entries in the pages content collection for the default locale. */
    const defaultLocalePages = getLocalePages(
      config.defaultLocale?.locale === 'root'
        ? undefined
        : config.defaultLocale?.locale,
    )
    for (const key in config.locales) {
      if (key === config.defaultLocale.locale)
        continue
      const localeConfig = config.locales[key]
      if (!localeConfig)
        continue
      const locale = key === 'root' ? undefined : key
      const localePages = getLocalePages(locale)
      for (const fallback of defaultLocalePages) {
        const slug = localizedSlug(fallback.slug, locale)
        const id = project.legacyCollections
          ? localizedId(fallback.id, locale)
          : slug
        const doesNotNeedFallback = localePages.some(
          doc => doc.slug === slug,
        )
        if (doesNotNeedFallback)
          continue
        routes.push({
          entry: fallback,
          slug,
          id,
          isFallback: true,
          lang: localeConfig.lang || BuiltInDefaultLocale.lang,
          locale,
          dir: localeConfig.dir,
          entryMeta: slugToLocaleData(fallback.slug),
        })
      }
    }
  }

  return routes
}
export const routes = getRoutes()

function getParamRouteMapping(): ReadonlyMap<string | undefined, Route> {
  const map = new Map<string | undefined, Route>()
  for (const route of routes) {
    map.set(slugToParam(route.slug), route)
  }
  return map
}
const routesBySlugParam = getParamRouteMapping()

export function getRouteBySlugParam(
  slugParam: string | undefined,
): Route | undefined {
  return routesBySlugParam.get(slugParam?.replace(/\/$/, '') || undefined)
}

function getPaths(): Path[] {
  return routes.map((route) => {
    return {
      params: { slug: slugToParam(route.slug) },
      props: route,
    }
  })
}

export const paths = getPaths()

/**
 * Get all routes for a specific locale.
 * A locale of `undefined` is treated as the “root” locale, if configured.
 */
export function getLocaleRoutes(locale: string | undefined): Route[] {
  return filterByLocale(routes, locale)
}

/**
 * Get all entries in the pages content collection for a specific locale.
 * A locale of `undefined` is treated as te “root” locale, if configured.
 */
function getLocalePages(locale: string | undefined): VitessePagesEntry[] {
  return filterByLocale(pages, locale)
}

/** Filter an array to find items whose slug matches the passed locale. */
function filterByLocale<T extends { slug: string }>(
  items: T[],
  locale: string | undefined,
): T[] {
  if (config.locales) {
    if (locale && locale in config.locales) {
      return items.filter(
        i => i.slug === locale || i.slug.startsWith(`${locale}/`),
      )
    }
    else if (config.locales.root) {
      const langKeys = Object.keys(config.locales).filter(k => k !== 'root')
      const isLangIndex = new RegExp(`^(${langKeys.join('|')})$`)
      const isLangDir = new RegExp(`^(${langKeys.join('|')})/`)
      return items.filter(
        i => !isLangIndex.test(i.slug) && !isLangDir.test(i.slug),
      )
    }
  }
  return items
}
