import { test, expect } from '@playwright/test'

test('home loads and shows TRS score chip', async ({ page, request }) => {
  await request.post('/api/test-auth', {
    data: { email: 'analyst@example.com', role: 'Analyst' }
  })
  await page.goto('/')
  await expect(page.locator('#trs-score')).toBeVisible()
})
