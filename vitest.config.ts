import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const projectRoot = resolve(process.cwd())

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(projectRoot, '.')
    }
  },
  test: {
    root: projectRoot,
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{spec,test}.ts'],
    exclude: ['tests-e2e/**', 'node_modules/**'],
    coverage: { reporter: ['text', 'html'], provider: 'v8' }
  }
})
