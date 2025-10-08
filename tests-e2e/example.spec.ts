import { test, expect } from '@playwright/test'

test('home loads and shows TRS score chip', async ({ page }) => {
  await page.goto('/')
  const chip = page.locator('#trs-score')
  await expect(chip).toBeVisible()
})
