import { expect, type Page, test } from '@playwright/test'
import { e2eUsers } from '../src/drizzle/seeds/e2e'

async function signIn(page: Page, user: { email: string; password: string }) {
  await page.goto('/login')
  await page.getByLabel('Email or username').fill(user.email)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL('/')
}

test('known user can log in and reach account and organization routes', async ({ page }) => {
  await signIn(page, e2eUsers.member)
  await expect(page).toHaveURL('/')

  await page.goto('/account')
  await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible()

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Welcome to CSK Choir Hub' })).toBeVisible()
})

test('non-admin users are denied admin routes', async ({ page }) => {
  await signIn(page, e2eUsers.member)
  const response = await page.goto('/admin/users')
  expect(response?.status()).toBe(403)
})

test('admin users can access admin routes', async ({ page }) => {
  await signIn(page, e2eUsers.admin)
  await page.goto('/admin/users')
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Groups' })).toBeVisible()
})

test('admin can create a user and view its details', async ({ page }) => {
  await signIn(page, e2eUsers.admin)
  await page.goto('/admin/users')
  await page.getByRole('button', { name: 'Create User' }).click()

  await page.getByLabel('Name').fill('Smoke CRUD User')
  await page.getByLabel('Email').fill('smoke-crud@example.com')
  await page.getByRole('button', { name: 'Create' }).click()

  await page.getByRole('button', { name: 'View' }).click()
  await expect(page).toHaveURL(/\/admin\/users\?detail=/)
  await expect(page.getByText('smoke-crud@example.com')).toBeVisible()
})
