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

export function PortalServices(props: { isAuthenticated: boolean }) {
  const { t } = useTranslation()
  return (
    <>
      <section
        id='solutions'
        className='portal-section portal-services'
        aria-labelledby='solutions-title'
      >
        <div className='portal-container portal-services-grid'>
          <div className='portal-services-copy'>
            <p className='portal-eyebrow'>{t('portal.services.eyebrow')}</p>
            <h2 id='solutions-title'>
              {t('portal.services.title.first')}
              <br />
              {t('portal.services.title.second')}
            </h2>
            <p className='portal-description'>
              {t('portal.services.description')}
            </p>
            <Button
              role='link'
              className='portal-button'
              variant='outline'
              render={
                <Link to={props.isAuthenticated ? '/dashboard' : '/sign-up'} />
              }
            >
              {t('portal.services.action')} <span aria-hidden>→</span>
            </Button>
          </div>
          <div className='portal-service-cards'>
            {['usage', 'quota', 'routing', 'sla', 'deployment', 'support'].map(
              (item, index) => (
                <article key={item}>
                  <span className='portal-service-number' aria-hidden='true'>
                    0{index + 1}
                  </span>
                  <h3>{t(`portal.services.${item}`)}</h3>
                  <p>{t(`portal.services.${item}.description`)}</p>
                </article>
              )
            )}
          </div>
        </div>
      </section>
      <section className='portal-cta-section' aria-labelledby='connect-title'>
        <div className='portal-container'>
          <div className='portal-cta'>
            <div>
              <p className='portal-eyebrow'>READY TO BUILD</p>
              <h2 id='connect-title'>{t('portal.cta.title')}</h2>
              <p>{t('portal.cta.description')}</p>
            </div>
            <Button
              role='link'
              className='portal-button'
              render={
                <Link to={props.isAuthenticated ? '/dashboard' : '/sign-up'} />
              }
            >
              {t(
                props.isAuthenticated
                  ? 'portal.action.console'
                  : 'portal.action.connect'
              )}{' '}
              <span aria-hidden>→</span>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
