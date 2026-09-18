import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { login, register } from '@/features/auth/api'
import { useAuthStore, type AuthBundle } from '@/stores/auth-store'

import { SignUpForm } from '../components/sign-up-form'

vi.mock('@/features/auth/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
}))
vi.mock('@/hooks/use-status', () => ({
  useStatus: () => ({ status: { oauth_register_enabled: false } }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const bundle: AuthBundle = {
  access_token: 'registration-login',
  token_type: 'Bearer',
  access_expires_at: 9999999999,
  user: { id: 42, username: 'new-user', role: 1 },
  session: {
    sid: 'registration-session',
    current: true,
    login_method: 'password',
    ip: '',
    user_agent: '',
    created_at: 1,
    last_active_at: 1,
    expires_at: 9999999999,
  },
}

afterEach(() => {
  cleanup()
  useAuthStore.getState().auth.reset('complete')
  vi.clearAllMocks()
})

async function submitRegistration() {
  const root = createRootRoute()
  const signUp = createRoute({
    getParentRoute: () => root,
    path: '/sign-up',
    component: SignUpForm,
  })
  const signIn = createRoute({
    getParentRoute: () => root,
    path: '/sign-in',
    component: () => <h1>Sign in page</h1>,
  })
  const dashboard = createRoute({
    getParentRoute: () => root,
    path: '/dashboard',
    component: () => <h1>Dashboard page</h1>,
  })
  const otp = createRoute({
    getParentRoute: () => root,
    path: '/otp',
    component: () => <h1>Verification page</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([signUp, signIn, dashboard, otp]),
    history: createMemoryHistory({ initialEntries: ['/sign-up'] }),
  })
  render(<RouterProvider router={router} />)

  const user = userEvent.setup()
  await user.type(await screen.findByRole('textbox', { name: 'Username' }), ' new-user ')
  await user.type(screen.getByLabelText('Password', { exact: true }), 'password123')
  await user.type(screen.getByLabelText('Confirm password'), 'password123')
  await user.click(screen.getByRole('button', { name: 'auth.portal.signupSubmit' }))
}

it('signs in with submitted credentials and enters the dashboard after registration succeeds', async () => {
  vi.mocked(register).mockResolvedValue({ success: true, message: '' })
  vi.mocked(login).mockResolvedValue({ success: true, message: '', data: bundle })

  await submitRegistration()

  expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeVisible()
  expect(login).toHaveBeenCalledWith({
    username: 'new-user',
    password: 'password123',
    passwordEncryptionEnabled: false,
  })
  expect(useAuthStore.getState().auth.user?.username).toBe('new-user')
})

it('returns to the sign-in page when registration succeeds but automatic sign-in fails', async () => {
  vi.mocked(register).mockResolvedValue({ success: true, message: '' })
  vi.mocked(login).mockResolvedValue({ success: false, message: 'Login failed' })

  await submitRegistration()

  expect(await screen.findByRole('heading', { name: 'Sign in page' })).toBeVisible()
  expect(useAuthStore.getState().auth.user).toBeNull()
})

it('continues to verification when automatic sign-in requires another factor', async () => {
  vi.mocked(register).mockResolvedValue({ success: true, message: '' })
  vi.mocked(login).mockResolvedValue({
    success: true,
    message: '',
    data: {
      require_verification: true,
      flow_token: 'new-user-login',
      expires_at: Math.floor(Date.now() / 1000) + 300,
      methods: [{ method: '2fa', available: true }],
    },
  })

  await submitRegistration()

  expect(await screen.findByRole('heading', { name: 'Verification page' })).toBeVisible()
  expect(useAuthStore.getState().auth.pendingLoginVerification?.challenge.flow_token).toBe(
    'new-user-login'
  )
})
