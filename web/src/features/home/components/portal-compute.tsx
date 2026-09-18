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
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'

const computeNodes = ['west', 'east', 'overseas'] as const
const supplySteps = ['gpu', 'scheduling', 'routing', 'sla'] as const

export function PortalCompute() {
  const { t } = useTranslation()
  return (
    <section
      id='compute'
      className='portal-compute portal-section'
      aria-labelledby='compute-title'
    >
      <div className='portal-container'>
        <p className='portal-eyebrow'>{t('portal.compute.eyebrow')}</p>
        <div className='portal-section-heading'>
          <div>
            <h2 id='compute-title'>{t('portal.compute.title')}</h2>
            <p>{t('portal.compute.description')}</p>
          </div>
          <a href='#compute-nodes'>
            {t('portal.compute.allNodes')} <span aria-hidden>→</span>
          </a>
        </div>
        <div id='compute-nodes' className='portal-compute-grid'>
          {computeNodes.map((node) => (
            <article
              key={node}
              className='portal-compute-card'
              aria-labelledby={`compute-${node}-title`}
            >
              <Badge
                variant={node === 'overseas' ? 'warning' : 'secondary'}
                className='portal-node-status'
              >
                {t(
                  node === 'overseas'
                    ? 'portal.compute.status.connecting'
                    : 'portal.compute.status.running'
                )}
              </Badge>
              <h3 id={`compute-${node}-title`}>
                {t(`portal.compute.${node}.title`)}
              </h3>
              <p className='portal-node-location'>
                {t(`portal.compute.${node}.location`)}
              </p>
              <dl className='portal-node-metrics'>
                <div>
                  <dt>{t('portal.compute.metric.latency')}</dt>
                  <dd>
                    {t(`portal.compute.${node}.latency`)}
                    <small>ms</small>
                  </dd>
                </div>
                <div>
                  <dt>{t('portal.compute.metric.capacity')}</dt>
                  <dd>
                    {t(`portal.compute.${node}.capacity`)}
                    <small>%</small>
                  </dd>
                </div>
                {node === 'west' && (
                  <div>
                    <dt>{t('portal.compute.metric.serviceArea')}</dt>
                    <dd className='portal-node-area'>
                      {t('portal.compute.west.serviceArea')}
                    </dd>
                  </div>
                )}
              </dl>
              <img
                className='portal-node-illustration'
                src={`/figma/portal-node-${node}-cutout.png`}
                alt={t(`portal.compute.${node}.title`)}
                width='503'
                height='316'
              />
            </article>
          ))}
          <article className='portal-supply'>
            <p className='portal-eyebrow'>TOKEN SUPPLY NETWORK</p>
            <h3>{t('portal.supply.title')}</h3>
            <ol>
              {supplySteps.map((item) => (
                <li key={item}>
                  <strong>{t(`portal.supply.${item}`)}</strong>
                  <p>{t(`portal.supply.${item}.description`)}</p>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </div>
    </section>
  )
}
