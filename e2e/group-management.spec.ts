import { expect, test } from '@playwright/test'

test('Group collection, route detail, creation, and direct membership management work together', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('member-dialog-e2e@example.invalid')
  await page.getByLabel('Password').fill('member-dialog-e2e-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/')
  await page.goto('/admin')
  await page.waitForURL('/admin/members')
  await page.goto('/admin/groups')

  expect(await page.getByRole('columnheader').allTextContents()).toEqual(['Name', 'Kind', 'Parent', 'Members'])
  await expect(page.getByRole('link', { name: 'View hierarchy' })).toHaveAttribute('href', '/admin/groups/hierarchy')

  const parentRow = page.getByRole('row').filter({ has: page.getByRole('link', { name: 'Group Dialog E2E' }) })
  const childRow = page.getByRole('row').filter({ has: page.getByRole('link', { name: 'Group Child E2E' }) })
  await expect(parentRow.getByRole('cell').nth(3)).toHaveText('0')
  await expect(childRow.getByRole('cell').nth(3)).toHaveText('1')

  const parentHref = await parentRow.getByRole('link', { name: 'Group Dialog E2E' }).getAttribute('href')
  expect(parentHref).toBeTruthy()
  await parentRow.getByRole('link', { name: 'Group Dialog E2E' }).click()
  const dialog = page.getByRole('dialog', { name: 'Group Dialog E2E' })
  await expect(dialog).toBeVisible()
  await expect(page).toHaveURL(parentHref ?? '')

  await dialog.getByRole('button', { name: 'Add Member' }).click()
  await dialog.getByLabel('Member', { exact: true }).selectOption({
    label: 'Member Dialog E2E (member-dialog-e2e@example.invalid)',
  })
  await dialog.getByLabel('Start date').fill('2025-02-01')
  await dialog.getByRole('button', { name: 'Add Membership' }).click()
  await expect(dialog.getByRole('button', { name: 'End Member Dialog E2E membership' })).toBeVisible()

  await dialog.getByRole('button', { name: 'End Member Dialog E2E membership' }).click()
  await dialog.getByLabel('End Member Dialog E2E membership in Group Dialog E2E').fill('2025-03-01')
  await dialog.getByRole('button', { name: 'Save end date' }).click()
  await expect(dialog.getByText('History')).toBeVisible()
  await expect(dialog.getByText('No current Group Memberships')).toBeVisible()

  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(page).toHaveURL('/admin/groups')
  if (!parentHref) throw new Error('Expected the Group row to link to its detail route.')
  await page.goto(parentHref)
  await expect(page.getByRole('heading', { level: 1, name: 'Group Dialog E2E' })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Close' })).toHaveAttribute('href', '/admin/groups')

  await page.goto('/admin/groups')
  await page.getByRole('link', { name: 'Create Group' }).click()
  const createDialog = page.getByRole('dialog', { name: 'Create Group' })
  await createDialog.getByLabel('Name').fill('Created Group E2E')
  await createDialog.getByLabel('Description').fill('Created through the route-backed dialog')
  await createDialog.getByLabel('Group Kind').selectOption('COMMITTEE')
  await createDialog.getByRole('button', { name: 'Create' }).click()
  await expect(page).toHaveURL(/\/admin\/groups\/[^/]+$/)
  await expect(page.getByRole('dialog', { name: 'Created Group E2E' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'Created Group E2E' })).toBeVisible()
})
