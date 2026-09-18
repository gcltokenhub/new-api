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

import { Button } from '@/components/ui/button'
import { useSystemConfig } from '@/hooks/use-system-config'

import { portalNavigation } from '../lib/portal-navigation'

export function PortalHeader(props: { isAuthenticated: boolean }) {
  const { t } = useTranslation()
  const { systemName } = useSystemConfig()
  return (
    <header className='portal-header'>
      <div className='portal-container portal-header-row'>
        <Link className='portal-brand' to='/'>
          <img src='/token-factory-mark.svg' alt='' width={30} height={30} />
          <span>{systemName}</span>
        </Link>
        <nav className='portal-nav' aria-label={t('portal.nav.label')}>
          {portalNavigation.map((item) =>
            item.href === '/dashboard' || item.href === '/playground' ? (
              <Link key={item.key} to={item.href}>
                {t(item.key)}
              </Link>
            ) : (
              <a key={item.key} href={item.href}>
                {t(item.key)}
              </a>
            )
          )}
        </nav>
        <Button
          role='link'
          className='portal-button'
          render={
            <Link to={props.isAuthenticated ? '/playground' : '/sign-up'} />
          }
        >
          {t(
            props.isAuthenticated
              ? 'portal.action.console'
              : 'portal.action.connect'
          )}
        </Button>
      </div>
    </header>
  )
}
