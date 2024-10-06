import type { Route } from './routing'

import config from 'virtual:vitesse/user-config'
import { formatPath } from './format-path'
import { getNavBar, type NavBarEntry } from './navigation'

export interface PageProps extends Route {

}

export interface VitesseRouteData extends Route {
  /** Title of the site. */
  siteTitle: string
  /** URL or path used as the link when clicking on the site title. */
  siteTitleHref: string
  isFullWidthLayout?: boolean
  /** Site navigation sidebar entries for this page. */
  navBar: NavBarEntry[]
}

/** Get the site title for a given language. */
export function getSiteTitle(lang: string): string {
  const defaultLang = config.defaultLocale.lang as string
  if (lang && config.title[lang]) {
    return config.title[lang] as string
  }
  return config.title[defaultLang] as string
}

export function getSiteTitleHref(locale: string | undefined): string {
  return formatPath(locale || '/')
}

export function generateRouteData({
  props,
  url,
}: {
  props: PageProps
  url: URL
}): VitesseRouteData {
  const { entry, locale, lang } = props
  const navBar = getNavBar(url.pathname, locale)

  const siteTitle = getSiteTitle(lang)
  return {
    ...props,
    siteTitle,
    navBar,
    siteTitleHref: getSiteTitleHref(locale),
    isFullWidthLayout: entry?.data.layoutFullWidth,
  }
}
