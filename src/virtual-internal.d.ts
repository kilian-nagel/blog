declare module 'virtual:vitesse/project-context' {
  const ProjectContext: {
    root: string
    srcDir: string
    trailingSlash: import('astro').AstroConfig['trailingSlash']
    build: {
      format: import('astro').AstroConfig['build']['format']
    }
  }
  export default ProjectContext
}

declare module 'virtual:vitesse/user-css' { }

declare module 'virtual:vitesse/user-images' {
  type ImageMetadata = import('astro').ImageMetadata
  export const logos: {
    dark?: ImageMetadata
    light?: ImageMetadata
  }
}

declare module 'virtual:vitesse/collection-config' {
  export const collections: import('astro:content').ContentConfig['collections'] | undefined
}

// components
declare module 'virtual:vitesse/components/ToggleTheme' {
  const ToggleTheme: typeof import('./components/ToggleTheme.astro').default
  export default ToggleTheme
}
declare module 'virtual:vitesse/components/Footer' {
  const Footer: typeof import('./components/Footer.astro').default
  export default Footer
}
declare module 'virtual:vitesse/components/ScrollToTop' {
  const ScrollToTop: typeof import('./components/ScrollToTop.astro').default
  export default ScrollToTop
}
declare module 'virtual:vitesse/components/SiteTitle' {
  const SiteTitle: typeof import('./components/SiteTitle.astro').default
  export default SiteTitle
}
declare module 'virtual:vitesse/components/NavBar' {
  const NavBar: typeof import('./components/NavBar.astro').default
  export default NavBar
}
