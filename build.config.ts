import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/theme',
    'src/schema',
    { input: 'src/routes/', outDir: 'dist/routes/' },
    { input: 'src/components/', outDir: 'dist/components/' },
    { input: 'src/layouts/', outDir: 'dist/layouts/' },
    { input: 'src/styles/', outDir: 'dist/styles/' },
  ],
  declaration: true,
  clean: true,
  externals: ['astro:content', 'astro/zod'],
  stubOptions: {
    jiti: {
      esmResolve: true,
    },
  },
})
