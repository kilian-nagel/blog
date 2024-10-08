import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      all: true,
      reportsDirectory: './coverage',
      exclude: [
        ...coverageConfigDefaults.exclude,
        'docs/**',
        '**/vitest.*',
        'src/types.ts',
        // We use this to set up test environments so it isn‘t picked up, but we are testing it downstream.
        'src/integrations/virtual-user-config.ts',
        // Types-only export.
        'src/props.ts',
        // Main integration entrypoint — don’t think we’re able to test this directly currently.
        'src/index.ts',
      ],
      // TODO: Uncomment when we have a stable coverage threshold.
      // thresholds: {
      //   autoUpdate: true,
      //   lines: 89.28,
      //   functions: 92.78,
      //   branches: 92.83,
      //   statements: 89.28,
      // },
    },
  },
})
