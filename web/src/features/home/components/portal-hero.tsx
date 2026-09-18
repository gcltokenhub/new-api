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

export function PortalHero() {
  const { t } = useTranslation()
  return (
    <section
      id='products'
      className='portal-hero'
      aria-labelledby='portal-title'
    >
      <div className='portal-container portal-hero-grid'>
        <div>
          <p className='portal-eyebrow'>{t('portal.eyebrow')}</p>
          <h1 id='portal-title'>
            {t('portal.hero.title')}
            <br />
            <span>{t('portal.hero.accent')}</span>
          </h1>
          <p className='portal-description'>{t('portal.hero.description')}</p>
          <div className='portal-actions'>
            <Button
              role='link'
              className='portal-button'
              render={<Link to='/playground' />}
            >
              {t('portal.action.experience')} <span aria-hidden>→</span>
            </Button>
            <Button
              role='link'
              className='portal-button'
              variant='outline'
              render={<a href='#solutions' />}
            >
              {t('portal.action.explore')}
            </Button>
          </div>
          <ul className='portal-benefits'>
            <li>{t('portal.benefit.api')}</li>
            <li>{t('portal.benefit.usage')}</li>
            <li>{t('portal.benefit.keys')}</li>
          </ul>
        </div>
        <div className='portal-architecture'>
          <img
            className='portal-architecture-image'
            src='/figma/portal-hero-cutout.png'
            alt={t('portal.architecture.imageAlt')}
            width={1482}
            height={843}
          />
        </div>
      </div>
    </section>
  )
}
