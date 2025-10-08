import { defineConfig } from '@playwright/test'
export default defineConfig({
  use: { headless: true, baseURL: 'http://localhost:3000' }
})
