import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    { input: 'src/routes/', outDir: 'dist/routes/' },
  ],
  declaration: true,
  clean: true,
  stubOptions: {
    jiti: {
      esmResolve: true,
    },
  },
})
