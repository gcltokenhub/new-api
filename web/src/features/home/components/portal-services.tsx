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
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export function PortalServices() {
  const { t } = useTranslation()
  const [contactOpen, setContactOpen] = useState(false)
  const contactRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!contactRef.current?.contains(event.target as Node)) {
        setContactOpen(false)
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setContactOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

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
              className='portal-button'
              variant='outline'
            >
              {t('portal.services.action')}
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
            <div
              ref={contactRef}
              className='portal-contact'
              data-open={contactOpen}
            >
              <Button
                className='portal-button'
                aria-expanded={contactOpen}
                aria-controls='portal-contact-panel'
                onClick={() => setContactOpen((open) => !open)}
              >
                {t('portal.cta.contact')}
              </Button>
              <div id='portal-contact-panel' className='portal-contact-panel'>
                <div className='portal-contact-card'>
                  <img
                    src='/wechat-contact-qr.png'
                    alt={t('portal.cta.qrCode')}
                    width={180}
                    height={180}
                  />
                  <p>{t('portal.cta.qrHint')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
