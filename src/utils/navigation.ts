import type {
  InternalSidebarLinkItem,
  LinkHTMLAttributes,
  NavBarItem,
  SidebarLinkItem,
} from '../schemas/navbar'
import type { VitesseConfig } from './user-config'
import { AstroError } from 'astro/errors'
import config from 'virtual:vitesse/user-config'
import { createPathFormatter } from './create-path-formatter'
import { formatPath } from './format-path'
import { pickLang } from './i18n'
import { ensureLeadingSlash, ensureTrailingSlash, stripLeadingAndTrailingSlashes } from './path'
import { getLocaleRoutes, type Route, routes } from './routing'
import { localeToLang, slugToPathname } from './slugs'

const DirKey = Symbol('DirKey')
const SlugKey = Symbol('SlugKey')

export interface Link {
  type: 'link'
  label: string
  href: string
  isCurrent: boolean
  attrs: LinkHTMLAttributes
}

export type NavBarEntry = Link

/**
 * A representation of the route structure. For each object entry:
 * if it’s a folder, the key is the directory name, and value is the directory
 * content; if it’s a route entry, the key is the last segment of the route, and value
 * is the full entry.
 */
interface Dir {
  [DirKey]: undefined
  [SlugKey]: string
  [item: string]: Dir | Route
}

/** Create a new directory object. */
function makeDir(slug: string): Dir {
  const dir = {} as Dir
  // Add DirKey and SlugKey as non-enumerable properties so that `Object.entries(dir)` ignores them.
  Object.defineProperty(dir, DirKey, { enumerable: false })
  Object.defineProperty(dir, SlugKey, { value: slug, enumerable: false })
  return dir
}

/** Test if the passed object is a directory record.  */
function isDir(data: Record<string, unknown>): data is Dir {
  return DirKey in data
}

/** Convert an item in a user’s navbar config to a navbar entry. */
function configItemToEntry(
  item: NavBarItem,
  currentPathname: string,
  locale: string | undefined,
): NavBarEntry {
  if ('link' in item) {
    return linkFromNavBarLinkItem(item, locale, currentPathname)
  }
  else if ('slug' in item) {
    return linkFromInternalNavBarLinkItem(item, locale, currentPathname)
  }
  throw new AstroError(
    'Invalid NavBar item configuration.',
    'Please ensure that the NavBar item is properly configured.\n'
    + 'Learn more about configuring the Vitesse NavBar at https://starlight.astro.build/guides/navbar',
  )
}

/** Check if a string starts with one of `http://` or `https://`. */
const isAbsolute = (link: string): boolean => /^https?:\/\//.test(link)

/** Create a link entry from a manual link item in user config. */
function linkFromNavBarLinkItem(
  item: SidebarLinkItem,
  locale: string | undefined,
  currentPathname: string,
): Link {
  let href = item.link
  if (!isAbsolute(href)) {
    href = ensureLeadingSlash(href)
    // Inject current locale into link.
    if (locale)
      href = `/${locale}${href}`
  }
  const label = pickLang(item.translations, localeToLang(locale)) || item.label
  return makeNavBarLink(
    href,
    label,
    currentPathname,
    item.attrs,
  )
}

/** Create a link entry from an automatic internal link item in user config. */
function linkFromInternalNavBarLinkItem(
  item: InternalSidebarLinkItem,
  locale: string | undefined,
  currentPathname: string,
): Link {
  // Astro passes root `index.[md|mdx]` entries with a slug of `index`
  const slug = item.slug === 'index' ? '' : item.slug
  const localizedSlug = locale ? (slug ? `${locale}/${slug}` : locale) : slug
  const entry = routes.find(entry => localizedSlug === entry.slug)
  if (!entry) {
    const hasExternalSlashes = item.slug.at(0) === '/' || item.slug.at(-1) === '/'
    if (hasExternalSlashes) {
      throw new AstroError(
        `The slug \`"${item.slug}"\` specified in the Vitesse navbar config must not start or end with a slash.`,
        `Please try updating \`"${item.slug}"\` to \`"${stripLeadingAndTrailingSlashes(item.slug)}"\`.`,
      )
    }
    else {
      throw new AstroError(
        `The slug \`"${item.slug}"\` specified in the Vitesse navbar config does not exist.`,
        'Update the Vitesse config to reference a valid entry slug in the docs content collection.\n'
        + 'Learn more about Astro content collection slugs at https://docs.astro.build/en/reference/api-reference/#getentry',
      )
    }
  }
  const label
    = pickLang(item.translations, localeToLang(locale)) || item.label || entry.entry.data.title
  return makeNavBarLink(
    entry.slug,
    label,
    currentPathname,
    item.attrs,
  )
}

/** Process navbar link options to create a link entry. */
function makeNavBarLink(
  href: string,
  label: string,
  currentPathname: string,
  attrs?: LinkHTMLAttributes,
): Link {
  if (!isAbsolute(href)) {
    href = formatPath(href)
  }
  const isCurrent = pathsMatch(encodeURI(href), currentPathname)
  return makeLink({ label, href, isCurrent, attrs })
}

/** Create a link entry */
function makeLink({
  isCurrent = false,
  attrs = {},
  ...opts
}: {
  label: string
  href: string
  isCurrent?: boolean
  attrs?: LinkHTMLAttributes | undefined
}): Link {
  return { type: 'link', ...opts, isCurrent, attrs }
}

/** Test if two paths are equivalent even if formatted differently. */
function pathsMatch(pathA: string, pathB: string): boolean {
  const format = createPathFormatter({ trailingSlash: 'never' })
  return format(pathA) === format(pathB)
}

/** Get the segments leading to a page. */
function getBreadcrumbs(path: string, baseDir: string): string[] {
  // Strip extension from path.
  const pathWithoutExt = stripExtension(path)
  // Index paths will match `baseDir` and don’t include breadcrumbs.
  if (pathWithoutExt === baseDir)
    return []
  // Ensure base directory ends in a trailing slash.
  baseDir = ensureTrailingSlash(baseDir)
  // Strip base directory from path if present.
  const relativePath = pathWithoutExt.startsWith(baseDir)
    ? pathWithoutExt.replace(baseDir, '')
    : pathWithoutExt

  return relativePath.split('/')
}

/** Turn a flat array of routes into a tree structure. */
function treeify(routes: Route[], baseDir: string): Dir {
  const treeRoot: Dir = makeDir(baseDir)
  routes
    // Remove any entries that should be hidden
    .filter(doc => !doc.entry.data.navbar.hidden)
    // Sort by depth, to build the tree depth first.
    .sort((a, b) => b.id.split('/').length - a.id.split('/').length)
    // Build the tree
    .forEach((doc) => {
      const parts = getBreadcrumbs(doc.id, baseDir)
      let currentNode = treeRoot

      parts.forEach((part, index) => {
        const isLeaf = index === parts.length - 1

        // Handle directory index pages by renaming them to `index`
        if (isLeaf && Object.prototype.hasOwnProperty.call(currentNode, part)) {
          currentNode = currentNode[part] as Dir
          part = 'index'
        }

        // Recurse down the tree if this isn’t the leaf node.
        if (!isLeaf) {
          const path = currentNode[SlugKey]
          currentNode[part] ||= makeDir(stripLeadingAndTrailingSlashes(`${path}/${part}`))
          currentNode = currentNode[part] as Dir
        }
        else {
          currentNode[part] = doc
        }
      })
    })

  return treeRoot
}

/** Create a link entry for a given content collection entry. */
function linkFromRoute(route: Route, currentPathname: string): Link {
  return makeNavBarLink(
    slugToPathname(route.slug),
    route.entry.data.navbar.label || route.entry.data.title,
    currentPathname,
    route.entry.data.navbar.attrs,
  )
}

/**
 * Get the sort weight for a given route or directory. Lower numbers rank higher.
 * Directories have the weight of the lowest weighted route they contain.
 */
function getOrder(routeOrDir: Route | Dir): number {
  return isDir(routeOrDir)
    ? Math.min(...Object.values(routeOrDir).flatMap(getOrder))
    : routeOrDir.entry.data.navbar.order ?? Number.MAX_VALUE
}

/** Sort a directory’s entries by user-specified order or alphabetically if no order specified. */
function sortDirEntries(dir: [string, Dir | Route][]): [string, Dir | Route][] {
  const collator = new Intl.Collator(localeToLang(undefined))
  return dir.sort(([_keyA, a], [_keyB, b]) => {
    const [aOrder, bOrder] = [getOrder(a), getOrder(b)]
    // Pages are sorted by order in ascending order.
    if (aOrder !== bOrder)
      return aOrder < bOrder ? -1 : 1
    // If two pages have the same order value they will be sorted by their slug.
    return collator.compare(isDir(a) ? a[SlugKey] : a.slug, isDir(b) ? b[SlugKey] : b.slug)
  })
}

/** Create a navbar entry for a directory or content entry. */
function dirToItem(
  dirOrRoute: Dir[string],
  currentPathname: string,
): NavBarEntry {
  if (!isDir(dirOrRoute)) {
    return linkFromRoute(dirOrRoute, currentPathname)
  }
  throw new AstroError('Invalid type: Expected Route but received Dir.')
}

/** Create a navbar entry for a given content directory. */
function navBarFromDir(
  tree: Dir,
  currentPathname: string,
): Link[] {
  return sortDirEntries(Object.entries(tree)).map(([_, dirOrRoute]) =>
    dirToItem(dirOrRoute, currentPathname),
  )
}

/** Get the navbar for the current page using the global config. */
export function getNavBar(pathname: string, locale: string | undefined): NavBarEntry[] {
  return getNavBarFromConfig(config.navBar, pathname, locale)
}

/** Get the navbar for the current page using the specified navbar config. */
export function getNavBarFromConfig(
  navBarConfig: VitesseConfig['navBar'],
  pathname: string,
  locale: string | undefined,
): NavBarEntry[] {
  const routes = getLocaleRoutes(locale)
  if (navBarConfig) {
    return navBarConfig.map(group => configItemToEntry(group, pathname, locale))
  }
  else {
    const tree = treeify(routes, locale || '')
    return navBarFromDir(tree, pathname)
  }
}

/** Remove the extension from a path. */
function stripExtension(path: string): string {
  const periodIndex = path.lastIndexOf('.')
  return path.slice(0, periodIndex > -1 ? periodIndex : undefined)
}
