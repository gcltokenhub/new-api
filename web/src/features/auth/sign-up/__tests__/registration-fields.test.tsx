/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { SignUpForm } from '../components/sign-up-form'

const statusState = vi.hoisted(() => ({ emailVerification: false }))

vi.mock('@/hooks/use-status', () => ({
  useStatus: () => ({
    status: {
      email_verification: statusState.emailVerification,
      oauth_register_enabled: false,
    },
  }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

afterEach(() => {
  cleanup()
  statusState.emailVerification = false
})

async function renderForm() {
  const root = createRootRoute()
  const route = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: SignUpForm,
  })
  const router = createRouter({
    routeTree: root.addChildren([route]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(<RouterProvider router={router} />)
  await screen.findByRole('button', { name: 'auth.portal.signupSubmit' })
}

it('shows only original registration fields when email verification is disabled', async () => {
  await renderForm()
  expect(screen.getByRole('textbox', { name: 'Username' })).toBeVisible()
  expect(screen.getByLabelText('Password', { exact: true })).toBeVisible()
  expect(screen.getByLabelText('Confirm password')).toBeVisible()
  expect(
    screen.queryByRole('textbox', { name: /Email/ })
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('textbox', { name: 'Verification code' })
  ).not.toBeInTheDocument()
})

it('shows the original email verification fields when enabled', async () => {
  statusState.emailVerification = true
  await renderForm()
  expect(
    screen.getByRole('textbox', { name: 'Email (required for verification)' })
  ).toBeVisible()
  expect(screen.getByPlaceholderText('Verification code')).toBeVisible()
})
