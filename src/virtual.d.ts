declare module 'virtual:vitesse/user-config' {
  const Config: import('./utils/user-config').VitesseConfig
  export default Config
}

declare module 'virtual:vitesse/plugin-translations' {
  const PluginTranslations: import('./utils/plugins').PluginTranslations
  export default PluginTranslations
}

declare module 'virtual:vitesse/user-images' {
  type ImageMetadata = import('astro').ImageMetadata
  export const logos: {
    dark?: ImageMetadata
    light?: ImageMetadata
  }
}
