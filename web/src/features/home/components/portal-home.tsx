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

import { useSystemConfig } from '@/hooks/use-system-config'

import '@/styles/portal.css'

import { PortalCompute } from './portal-compute'
import { PortalHeader } from './portal-header'
import { PortalHero } from './portal-hero'
import { PortalModels } from './portal-models'
import { PortalServices } from './portal-services'

export function PortalHome(props: { isAuthenticated: boolean }) {
  const { t } = useTranslation()
  const { systemName } = useSystemConfig()
  return (
    <div className='token-portal'>
      <a className='portal-skip' href='#portal-main'>
        {t('portal.skip')}
      </a>
      <PortalHeader isAuthenticated={props.isAuthenticated} />
      <main id='portal-main' tabIndex={-1}>
        <PortalHero />
        <PortalCompute />
        <PortalModels />
        <PortalServices />
      </main>
      <footer className='portal-footer'>
        <div className='portal-container'>
          <Link className='portal-brand' to='/'>
            <img src='/token-factory-mark.svg' alt='' width={28} height={28} />
            <span>{systemName}</span>
          </Link>
          <p>{t('portal.footer.description')}</p>
          <span>
            © {new Date().getFullYear()} {systemName}
          </span>
        </div>
      </footer>
    </div>
  )
}
