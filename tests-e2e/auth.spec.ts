import { test, expect } from '@playwright/test'

test('mock sign-in grants Analyst navigation but hides exec modules', async ({ page, request }) => {
  await request.post('/api/test-auth', {
    data: { email: 'analyst@example.com', role: 'Analyst' }
  })

  await page.goto('/')

  const nav = page.locator('aside nav')
  await expect(nav.getByText('Deliverables')).toBeVisible()
  await expect(nav.getByText('KPIs & Alerts')).toBeVisible()
  await expect(nav.getByText('Executive Room')).toHaveCount(0)
  await expect(page.locator('text=Analyst')).toBeVisible()
})
