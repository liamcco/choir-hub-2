import { expect, test } from '@playwright/test'

test('member route dialog is bounded on desktop and full-screen on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/login')
  await page.getByLabel('Email').fill('member-dialog-e2e@example.invalid')
  await page.getByLabel('Password').fill('member-dialog-e2e-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/')
  await page.goto('/admin/users')
  await page.getByRole('link', { name: 'Member Dialog E2E' }).click()

  const dialog = page.getByRole('dialog', { name: 'Member Dialog E2E' })
  await expect(dialog).toBeVisible()
  await expect.poll(async () => (await dialog.boundingBox())?.width).toBeGreaterThanOrEqual(1022)
  expect((await dialog.boundingBox())?.width).toBeLessThanOrEqual(1026)
  expect(await dialog.getByRole('region', { name: 'Member Dialog E2E detail content' }).count()).toBe(1)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(dialog).toBeVisible()
  await expect.poll(async () => await dialog.boundingBox()).toEqual({ x: 0, y: 0, width: 390, height: 844 })
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeVisible()
  expect(await dialog.getByRole('region', { name: 'Member Dialog E2E detail content' }).count()).toBe(1)
})
