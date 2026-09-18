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

import { AuthLayout } from '../auth-layout'

vi.mock('react-i18next', async () => {
  const zh = await import('@/i18n/locales/zh.json')
  return {
    useTranslation: () => ({
      t: (key: string) =>
        zh.default.translation[key as keyof typeof zh.default.translation] ??
        key,
    }),
  }
})

vi.mock('@/hooks/use-system-config', () => ({
  useSystemConfig: () => ({
    systemName: 'Token 工厂',
    logo: '/logo.png',
    loading: false,
  }),
}))

afterEach(cleanup)

async function renderVariant(variant: 'sign-in' | 'sign-up') {
  const root = createRootRoute()
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div>Home</div>,
  })
  const auth = createRoute({
    getParentRoute: () => root,
    path: '/auth',
    component: () => (
      <AuthLayout variant={variant}>
        <p>Form content</p>
      </AuthLayout>
    ),
  })
  const router = createRouter({
    routeTree: root.addChildren([home, auth]),
    history: createMemoryHistory({ initialEntries: ['/auth'] }),
  })
  render(<RouterProvider router={router} />)
  await screen.findByText('Form content')
}

it('shows the login brand panel and keeps the form as selectable content', async () => {
  await renderVariant('sign-in')
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    '让每一次模型调用'
  )
  expect(screen.getByText('Form content')).toBeVisible()
  expect(screen.getByRole('link', { name: /返回官网/ })).toHaveAttribute(
    'href',
    '/'
  )
})

it('shows the registration panel without implying that it submits an enterprise request', async () => {
  await renderVariant('sign-up')
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    '从一个项目开始'
  )
  expect(screen.getByText('Form content')).toBeVisible()
})
