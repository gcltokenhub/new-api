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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'

import './auth.css'

type AuthLayoutProps = {
  children: React.ReactNode
  variant?: 'sign-in' | 'sign-up'
}

export function AuthLayout({ children, variant }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  if (variant) {
    return (
      <main className='token-auth grid min-h-svh bg-white text-[#172033] lg:grid-cols-2'>
        <section
          className='relative flex min-h-[520px] flex-col overflow-hidden bg-[radial-gradient(circle_at_75%_85%,#1c4c83_0%,transparent_55%),linear-gradient(145deg,#142137,#15345f)] px-7 py-8 text-white sm:px-12 sm:py-10 lg:min-h-svh lg:px-[10%] lg:py-14'
          aria-label={t('auth.portal.brandPanel')}
        >
          <Link
            to='/'
            className='relative z-10 flex w-fit items-center gap-3 text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'
          >
            {loading ? (
              <Skeleton className='h-8 w-8 rounded-full' />
            ) : (
              <img src={logo} alt='' className='h-8 w-8 object-contain' />
            )}
            <span>Token 工厂</span>
          </Link>
          <div className='relative z-10 mt-12 max-w-[580px] lg:mt-16'>
            <p className='mb-5 text-[11px] font-semibold tracking-[0.22em] text-[#b5cee9]'>
              <span className='mr-2 text-[#54d8bf]'>●</span>
              {t('auth.portal.eyebrow')}
            </p>
            <h1 className='text-3xl leading-tight font-bold sm:text-4xl xl:text-[42px]'>
              {t(
                variant === 'sign-in'
                  ? 'auth.portal.loginHeadline'
                  : 'auth.portal.signupHeadline'
              )}
              <br />
              <span className='text-[#92ceff]'>
                {t(
                  variant === 'sign-in'
                    ? 'auth.portal.loginAccent'
                    : 'auth.portal.signupAccent'
                )}
              </span>
            </h1>
            <p className='mt-6 text-sm leading-7 text-[#c7d6e9]'>
              {t(
                variant === 'sign-in'
                  ? 'auth.portal.loginDescription'
                  : 'auth.portal.signupDescription'
              )}
            </p>
          </div>
          <div
            className='relative z-10 flex flex-1 items-center justify-center'
            aria-hidden='true'
          >
            <img
              src='/figma/auth-token-illustration.png'
              alt=''
              className='w-full max-w-[660px] object-contain'
            />
          </div>
          <p className='relative z-10 border-t border-white/15 pt-6 text-xs text-[#bad1e9]'>
            {t(
              variant === 'sign-in'
                ? 'auth.portal.loginBenefits'
                : 'auth.portal.signupBenefits'
            )}
          </p>
        </section>
        <section
          className='flex min-w-0 flex-col px-7 py-8 sm:px-12 sm:py-10 lg:min-h-svh lg:px-[16%] lg:py-14'
          aria-label={t(
            variant === 'sign-in'
              ? 'auth.portal.loginCaption'
              : 'auth.portal.signupCaption'
          )}
        >
          <div className='text-muted-foreground flex items-center justify-between gap-4 text-xs'>
            <Link
              to='/'
              className='hover:text-primary w-fit focus-visible:outline-2 focus-visible:outline-offset-4'
            >
              {t('auth.portal.backHome')}
            </Link>
            <span>
              {t(
                variant === 'sign-in'
                  ? 'auth.portal.consoleCaption'
                  : 'auth.portal.registrationCaption'
              )}
            </span>
          </div>
          <div className='mx-auto flex w-full max-w-[470px] flex-1 flex-col justify-start pt-14 pb-12 lg:pt-16'>
            {children}
          </div>
          <footer className='text-muted-foreground flex justify-between gap-4 border-t pt-6 text-xs'>
            <span>© 2026 Token 工厂</span>
            <span>{t('portal.footer.description')}</span>
          </footer>
        </section>
      </main>
    )
  }

  return (
    <div className='relative grid h-svh max-w-none'>
      <Link
        to='/'
        className='absolute top-4 left-4 z-10 flex items-center gap-2 transition-opacity hover:opacity-80 sm:top-8 sm:left-8'
      >
        <div className='relative h-8 w-8'>
          {loading ? (
            <Skeleton className='absolute inset-0 rounded-full' />
          ) : (
            <img
              src={logo}
              alt={t('Logo')}
              className='h-8 w-8 rounded-full object-cover'
            />
          )}
        </div>
        {loading ? (
          <Skeleton className='h-6 w-24' />
        ) : (
          <h1 className='text-xl font-medium'>{systemName}</h1>
        )}
      </Link>
      <div className='container flex items-center pt-16 sm:pt-0'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 px-4 py-8 sm:w-[480px] sm:p-8'>
          {children}
        </div>
      </div>
    </div>
  )
}
